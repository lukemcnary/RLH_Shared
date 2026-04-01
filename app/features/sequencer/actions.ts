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

function getDataverseRecordIdFromHeader(response: Response) {
  const entityId = response.headers.get('OData-EntityId') ?? response.headers.get('odata-entityid') ?? ''
  const match = entityId.match(/\(([0-9a-fA-F-]{36})\)$/)
  return match ? match[1] : null
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
    steps?: CreateMobilizationPayload['steps']
    markers?: CreateMobilizationPayload['markers']
  },
): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (payload.why !== undefined) body.cr6cd_why = payload.why
  if (payload.startOffset !== undefined) body.cr6cd_startoffset = payload.startOffset
  if (payload.duration !== undefined) body.cr6cd_durationdays = payload.duration
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
      steps: toMockSteps(mobilizationId, payload.steps),
      markers: toMockMarkers(mobilizationId, payload.markers),
    })

    revalidatePath(projectPath(payload.projectId))
    return { ok: true, id: mobilizationId }
  }

  try {
    const res = await dvFetch('cr6cd_mobilizations', {
      method: 'POST',
      body: JSON.stringify(
        buildMobilizationPayload({
          ...payload,
          steps: payload.steps ?? [],
          markers: payload.markers ?? [],
        }),
      ),
    })

    revalidatePath(projectPath(payload.projectId))
    return { ok: true, id: getDataverseRecordIdFromHeader(res) ?? undefined }
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
        `rlh_tradeitems?$select=rlh_tradeitemid&$filter=_rlh_mobilization_value eq guid'${mobilizationId}'`
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
        `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid&$filter=_cr720_mobilization_value eq guid'${mobilizationId}'`
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
