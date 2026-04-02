// ============================================================
// Server Actions — Sequencer
// ============================================================
//
// All mutations for the sequencer board go through here.
// These are Next.js Server Actions ("use server") which run
// on the server and call revalidatePath() so the board re-fetches
// fresh data after every mutation.
//
// In MOCK mode the actions are no-ops that just revalidate.
// In LIVE mode they write to Dataverse via dvFetch().
//
// Dataverse write patterns:
//   CREATE  POST   /cr6cd_mobilizations          body: full object
//   UPDATE  PATCH  /cr6cd_mobilizations(guid)    body: changed fields only
//   DELETE  DELETE /cr6cd_mobilizations(guid)    no body
//
// Linking a navigation property (lookup):
//   "cr6cd_buildphase_value@odata.bind": "/cr6cd_buildphases(guid)"
//
// Compatibility note:
//   RLH_Shared does not treat cr6cd_stepsjson / cr6cd_markersjson as
//   authoritative read sources for sequencing logic. We still emit them
//   on writes as a temporary bridge while Trevor compatibility exists.
// ============================================================

'use server'

import { revalidatePath } from 'next/cache'
import { dvFetch } from '@/lib/dataverse/client'
import type {
  CreateMobilizationPayload,
  CreateProjectTradePayload,
  MobilizationMarker,
  TradeItem,
  UpdateMobilizationPayload,
  UpdateGatePayload,
} from '@/types/database'

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

// ─── Helpers ─────────────────────────────────────────────────

function projectPath(projectId: string) {
  return `/projects/${projectId}/sequencer`
}

async function loadMockData() {
  return await import('@/lib/mock-data')
}

/**
 * Map GateLockStatus to Dataverse picklist.
 */
const GATE_LOCK_TO_DV: Record<string, number> = {
  unlocked:  936880000,
  soft_lock: 936880001,
  hard_lock: 936880002,
}

const TRADE_ITEM_TYPE_TO_DV: Record<string, number> = {
  prep:     936880000,
  decision: 936880001,
  question: 936880002,
  action:   936880003,
  risk:     936880004,
}

const TRADE_ITEM_STATUS_TO_DV: Record<string, number> = {
  open:   936880000,
  closed: 936880001,
}

function getDataverseRecordIdFromHeader(response: Response) {
  const entityId = response.headers.get('OData-EntityId') ?? response.headers.get('odata-entityid') ?? ''
  const match = entityId.match(/\(([0-9a-fA-F-]{36})\)$/)
  return match ? match[1] : null
}

function mobilizationFilter(mobilizationId: string, fields: string[]) {
  return fields
    .map((field) => `${field} eq '${mobilizationId}'`)
    .join(' or ')
}

function serializeSteps(steps: CreateMobilizationPayload['steps']) {
  return JSON.stringify(
    (steps ?? []).map((step, index) => ({
      id: step.id,
      short: step.name,
      name: step.name,
      notes: step.notes ?? '',
      sortOrder: step.sortOrder ?? index + 1,
      type: step.type,
      status: step.status,
    })),
  )
}

function serializeMarkers(markers: CreateMobilizationPayload['markers']) {
  return JSON.stringify(
    (markers ?? []).map((marker) => ({
      id: marker.id,
      label: marker.label,
      text: marker.label,
      notes: marker.notes ?? '',
      position: marker.position,
      pos: marker.position,
    })),
  )
}

function buildMobilizationPayload(
  payload: {
    projectId: string
    projectTradeId?: string
    gateId?: string
    why?: string
    startOffset?: number
    duration?: number
    displayOrder?: number
    steps?: CreateMobilizationPayload['steps']
    markers?: CreateMobilizationPayload['markers']
  },
): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (payload.why !== undefined) body.cr6cd_why = payload.why
  if (payload.startOffset !== undefined) body.cr6cd_startoffset = payload.startOffset
  if (payload.duration !== undefined) body.cr6cd_durationdays = payload.duration
  if (payload.displayOrder !== undefined) body.cr6cd_displayorder = payload.displayOrder
  // Temporary compatibility bridge for Trevor's current app.
  if (payload.steps !== undefined) body.cr6cd_stepsjson = serializeSteps(payload.steps)
  if (payload.markers !== undefined) body.cr6cd_markersjson = serializeMarkers(payload.markers)

  body.cr6cd_newcolumn = String(payload.why || 'Mobilization').slice(0, 100)

  if (payload.projectId) body['cr6cd_Project@odata.bind'] = `/cr6cd_projects(${payload.projectId})`
  if (payload.projectTradeId) body['cr6cd_ProjectTrade@odata.bind'] = `/rlh_projecttrades(${payload.projectTradeId})`
  if (payload.gateId) body['cr6cd_BuildPhase@odata.bind'] = `/cr6cd_buildphases(${payload.gateId})`

  return body
}

function toMockSteps(
  mobilizationId: string,
  steps: CreateMobilizationPayload['steps'] = [],
) {
  return (steps ?? []).map((step, index) => ({
    ...step,
    mobilizationId,
    sortOrder: step.sortOrder ?? index + 1,
  }))
}

function toMockMarkers(
  mobilizationId: string,
  markers: CreateMobilizationPayload['markers'] = [],
) {
  return (markers ?? []).map((marker) => ({
    ...marker,
    mobilizationId,
  }))
}

async function replaceTradeItems(
  mobilizationId: string,
  steps: Omit<TradeItem, 'mobilizationId'>[] = [],
): Promise<void> {
  const existingRes = await dvFetch(
    `rlh_tradeitems?$select=rlh_tradeitemid&$filter=${mobilizationFilter(mobilizationId, [
      '_rlh_mobilization_value',
      '_cr6cd_mobilizationsid_value',
    ])}`
  )
  const existing = (await existingRes.json()) as { value: { rlh_tradeitemid: string }[] }

  await Promise.all(
    existing.value.map((tradeItem) =>
      dvFetch(`rlh_tradeitems(${tradeItem.rlh_tradeitemid})`, { method: 'DELETE' })
    )
  )

  for (const [index, step] of steps.entries()) {
    const body: Record<string, unknown> = {
      rlh_name: step.name,
      rlh_sortorder: step.sortOrder ?? index + 1,
      'rlh_mobilization@odata.bind': `/cr6cd_mobilizations(${mobilizationId})`,
    }

    if (step.notes !== undefined) body.rlh_notes = step.notes
    if (step.type !== undefined) body.rlh_type = TRADE_ITEM_TYPE_TO_DV[step.type]
    if (step.status !== undefined) body.rlh_status = TRADE_ITEM_STATUS_TO_DV[step.status]

    await dvFetch('rlh_tradeitems', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

async function replaceMobilizationMarkers(
  mobilizationId: string,
  markers: Omit<MobilizationMarker, 'mobilizationId'>[] = [],
): Promise<void> {
  const existingRes = await dvFetch(
    `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid&$filter=${mobilizationFilter(mobilizationId, [
      '_cr720_mobilization_value',
      '_cr6cd_mobilization_value',
      '_cr6cd_mobilizationsid_value',
    ])}`
  )
  const existing = (await existingRes.json()) as { value: { cr6cd_mobilizationmarkersid: string }[] }

  await Promise.all(
    existing.value.map((marker) =>
      dvFetch(`cr6cd_mobilizationmarkerses(${marker.cr6cd_mobilizationmarkersid})`, { method: 'DELETE' })
    )
  )

  for (const marker of markers) {
    const body: Record<string, unknown> = {
      cr6cd_name: marker.label,
      rlh_position: marker.position,
      'cr6cd_mobilization@odata.bind': `/cr6cd_mobilizations(${mobilizationId})`,
    }

    if (marker.notes !== undefined) body.cr6cd_notes = marker.notes

    await dvFetch('cr6cd_mobilizationmarkerses', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}

async function syncCompatibilityChildRecords(
  mobilizationId: string,
  payload: {
    steps?: CreateMobilizationPayload['steps'] | UpdateMobilizationPayload['steps']
    markers?: CreateMobilizationPayload['markers'] | UpdateMobilizationPayload['markers']
  },
) {
  if (payload.steps !== undefined) {
    try {
      await replaceTradeItems(mobilizationId, payload.steps)
    } catch (error) {
      console.warn('[syncCompatibilityChildRecords] trade item sync skipped', error)
    }
  }

  if (payload.markers !== undefined) {
    try {
      await replaceMobilizationMarkers(mobilizationId, payload.markers)
    } catch (error) {
      console.warn('[syncCompatibilityChildRecords] marker sync skipped', error)
    }
  }
}


// ─── Mobilization mutations ───────────────────────────────────

/**
 * Create a new mobilization in the given gate for the given trade.
 */
export async function createMobilization(
  payload: CreateMobilizationPayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (IS_MOCK) {
    const mock = await loadMockData()
    const projectTrade = mock.MOCK_PROJECT_TRADES.find((candidate) => candidate.id === payload.projectTradeId)
    const mobilizationId = `mock-mob-${Date.now()}`

    mock.MOCK_MOBILIZATIONS.push({
      id: mobilizationId,
      projectId: payload.projectId,
      gateId: payload.gateId,
      projectTradeId: payload.projectTradeId,
      tradeType: projectTrade?.tradeType ?? { id: '', name: '', code: '' },
      why: payload.why,
      status: 'draft',
      startOffset: payload.startOffset,
      duration: payload.duration,
      displayOrder: payload.displayOrder,
      steps: toMockSteps(mobilizationId, payload.steps),
      markers: toMockMarkers(mobilizationId, payload.markers),
    })

    revalidatePath(projectPath(payload.projectId))
    return { ok: true, id: mobilizationId }
  }

  try {
    const res = await dvFetch('cr6cd_mobilizations', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(
        buildMobilizationPayload({
          ...payload,
          steps: payload.steps ?? [],
          markers: payload.markers ?? [],
        }),
      ),
    })

    const mobilizationId = getDataverseRecordIdFromHeader(res)
    if (mobilizationId) {
      await syncCompatibilityChildRecords(mobilizationId, {
        steps: payload.steps ?? [],
        markers: payload.markers ?? [],
      })
    } else if ((payload.steps?.length ?? 0) > 0 || (payload.markers?.length ?? 0) > 0) {
      console.warn('[createMobilization] compatibility child sync skipped because the created mobilization id was unavailable')
    }

    revalidatePath(projectPath(payload.projectId))
    return { ok: true, id: mobilizationId ?? undefined }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[createMobilization]', msg)
    return { ok: false, error: msg }
  }
}

/**
 * Update an existing mobilization.
 * Handles position changes, status, why, and replaces steps + markers wholesale.
 */
export async function updateMobilization(
  payload: UpdateMobilizationPayload,
  projectId: string
): Promise<{ ok: boolean; error?: string }> {
  if (IS_MOCK) {
    const mock = await loadMockData()
    const existing = mock.MOCK_MOBILIZATIONS.find((mobilization) => mobilization.id === payload.id)
    if (!existing) {
      return { ok: false, error: `Mock mobilization ${payload.id} not found` }
    }

    if (payload.projectTradeId !== undefined) {
      const projectTrade = mock.MOCK_PROJECT_TRADES.find((candidate) => candidate.id === payload.projectTradeId)
      existing.projectTradeId = payload.projectTradeId
      if (projectTrade?.tradeType) {
        existing.tradeType = projectTrade.tradeType
      }
    }
    if (payload.gateId !== undefined) existing.gateId = payload.gateId
    if (payload.why !== undefined) existing.why = payload.why
    if (payload.startOffset !== undefined) existing.startOffset = payload.startOffset
    if (payload.duration !== undefined) existing.duration = payload.duration
    if (payload.displayOrder !== undefined) existing.displayOrder = payload.displayOrder
    if (payload.steps !== undefined) existing.steps = toMockSteps(existing.id, payload.steps)
    if (payload.markers !== undefined) existing.markers = toMockMarkers(existing.id, payload.markers)

    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    const body = buildMobilizationPayload({
      projectId,
      gateId: payload.gateId,
      projectTradeId: payload.projectTradeId,
      why: payload.why,
      startOffset: payload.startOffset,
      duration: payload.duration,
      displayOrder: payload.displayOrder,
      steps: payload.steps,
      markers: payload.markers,
    })

    // Only PATCH if there is something to patch
    if (Object.keys(body).length > 0 && !(Object.keys(body).length === 1 && body.cr6cd_newcolumn)) {
      await dvFetch(`cr6cd_mobilizations(${payload.id})`, {
        method: 'PATCH',
        body:   JSON.stringify(body),
      })
    }

    await syncCompatibilityChildRecords(payload.id, {
      steps: payload.steps,
      markers: payload.markers,
    })

    revalidatePath(projectPath(projectId))
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[updateMobilization]', msg)
    return { ok: false, error: msg }
  }
}

/**
 * Delete a mobilization and all its child records.
 * Dataverse cascades deletes on trade items and markers by default
 * when the relationship is set to cascade. If not, we delete children first.
 */
export async function deleteMobilization(
  mobilizationId: string,
  projectId: string
): Promise<{ ok: boolean; error?: string }> {
  if (IS_MOCK) {
    const mock = await loadMockData()
    const index = mock.MOCK_MOBILIZATIONS.findIndex((mobilization) => mobilization.id === mobilizationId)
    if (index >= 0) {
      mock.MOCK_MOBILIZATIONS.splice(index, 1)
    }

    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    try {
      const tradeItemsRes = await dvFetch(
        `rlh_tradeitems?$select=rlh_tradeitemid&$filter=${mobilizationFilter(mobilizationId, [
          '_rlh_mobilization_value',
          '_cr6cd_mobilizationsid_value',
        ])}`
      )
      const tradeItems = (await tradeItemsRes.json()) as { value: { rlh_tradeitemid: string }[] }
      await Promise.all(
        tradeItems.value.map(ti =>
          dvFetch(`rlh_tradeitems(${ti.rlh_tradeitemid})`, { method: 'DELETE' })
        )
      )
    } catch (error) {
      console.warn('[deleteMobilization] trade item cleanup skipped', error)
    }

    try {
      const markersRes = await dvFetch(
        `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid&$filter=${mobilizationFilter(mobilizationId, [
          '_cr720_mobilization_value',
          '_cr6cd_mobilization_value',
          '_cr6cd_mobilizationsid_value',
        ])}`
      )
      const markers = (await markersRes.json()) as { value: { cr6cd_mobilizationmarkersid: string }[] }
      await Promise.all(
        markers.value.map(m =>
          dvFetch(`cr6cd_mobilizationmarkerses(${m.cr6cd_mobilizationmarkersid})`, { method: 'DELETE' })
        )
      )
    } catch (error) {
      console.warn('[deleteMobilization] marker cleanup skipped', error)
    }

    // Delete the mobilization itself
    await dvFetch(`cr6cd_mobilizations(${mobilizationId})`, { method: 'DELETE' })

    revalidatePath(projectPath(projectId))
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[deleteMobilization]', msg)
    return { ok: false, error: msg }
  }
}


// ─── Gate mutations ───────────────────────────────────────────

/**
 * Update gate metadata (lock status, window dates, description).
 */
export async function updateGate(
  payload: UpdateGatePayload,
  projectId: string
): Promise<{ ok: boolean; error?: string }> {
  if (IS_MOCK) {
    const mock = await loadMockData()
    const existing = mock.MOCK_GATES.find((gate) => gate.id === payload.id)
    if (!existing) {
      return { ok: false, error: `Mock gate ${payload.id} not found` }
    }

    if (payload.description !== undefined) existing.description = payload.description
    if (payload.lockStatus !== undefined) existing.lockStatus = payload.lockStatus
    if (payload.workingWindowStart !== undefined) existing.workingWindowStart = payload.workingWindowStart
    if (payload.workingWindowEnd !== undefined) existing.workingWindowEnd = payload.workingWindowEnd
    if (payload.declaredWindowStart !== undefined) existing.declaredWindowStart = payload.declaredWindowStart
    if (payload.declaredWindowEnd !== undefined) existing.declaredWindowEnd = payload.declaredWindowEnd

    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    const body: Record<string, unknown> = {}

    if (payload.description !== undefined)        body.cr6cd_description          = payload.description
    if (payload.lockStatus !== undefined)         body.rlh_lockstatus             = GATE_LOCK_TO_DV[payload.lockStatus]
    if (payload.workingWindowStart !== undefined) body.rlh_workingwindowstart     = payload.workingWindowStart
    if (payload.workingWindowEnd !== undefined)   body.rlh_workingwindowend       = payload.workingWindowEnd
    if (payload.declaredWindowStart !== undefined) body.rlh_declaredwindowstart   = payload.declaredWindowStart
    if (payload.declaredWindowEnd !== undefined)  body.rlh_declaredwindowend      = payload.declaredWindowEnd

    if (Object.keys(body).length > 0) {
      await dvFetch(`cr6cd_buildphases(${payload.id})`, {
        method: 'PATCH',
        body:   JSON.stringify(body),
      })
    }

    revalidatePath(projectPath(projectId))
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[updateGate]', msg)
    return { ok: false, error: msg }
  }
}


// ─── Project trade mutations ──────────────────────────────────

/**
 * Add a trade type to a project by creating a project-trade junction row.
 */
export async function createProjectTrade(
  payload: CreateProjectTradePayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (IS_MOCK) {
    const mock = await loadMockData()
    const tradeType = mock.MOCK_TRADE_TYPES.find(t => t.id === payload.tradeTypeId)
    if (!tradeType) return { ok: false, error: 'Trade type not found' }

    const id = `mock-pt-${Date.now()}`
    mock.MOCK_PROJECT_TRADES.push({
      id,
      projectId: payload.projectId,
      tradeTypeId: payload.tradeTypeId,
      tradeType,
      stage: 'planned',
    })

    revalidatePath(projectPath(payload.projectId))
    revalidatePath(`/projects/${payload.projectId}/trades`)
    return { ok: true, id }
  }

  try {
    const body = {
      'rlh_Project@odata.bind': `/cr6cd_projects(${payload.projectId})`,
      'rlh_Trade@odata.bind': `/cr6cd_trades(${payload.tradeTypeId})`,
      rlh_stage: 936880000, // Planned
    }

    const res = await dvFetch('rlh_projecttrades', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body),
    })

    const id = getDataverseRecordIdFromHeader(res) ?? undefined

    revalidatePath(projectPath(payload.projectId))
    revalidatePath(`/projects/${payload.projectId}/trades`)
    return { ok: true, id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[createProjectTrade]', msg)
    return { ok: false, error: msg }
  }
}
