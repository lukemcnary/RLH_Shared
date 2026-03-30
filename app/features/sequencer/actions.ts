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
// ============================================================

'use server'

import { revalidatePath } from 'next/cache'
import { dvFetch } from '@/lib/dataverse/client'
import type {
  CreateMobilizationPayload,
  UpdateMobilizationPayload,
  UpdateGatePayload,
  TradeItem,
  MobilizationMarker,
} from '@/types/database'

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

// ─── Helpers ─────────────────────────────────────────────────

function projectPath(projectId: string) {
  return `/projects/${projectId}/sequencer`
}

/**
 * Map our domain MobilizationStatus string to a Dataverse picklist integer.
 * Matches the STATUS_MAP in lib/dataverse/queries/mobilizations.ts (reversed).
 */
const MOB_STATUS_TO_DV: Record<string, number> = {
  draft:       936880000,
  confirmed:   936880001,
  in_progress: 936880002,
  complete:    936880003,
}

/**
 * Map TradeItemType to Dataverse picklist.
 */
const TRADE_ITEM_TYPE_TO_DV: Record<string, number> = {
  prep:     936880000,
  decision: 936880001,
  question: 936880002,
  action:   936880003,
  risk:     936880004,
}

/**
 * Map TradeItemStatus to Dataverse picklist.
 */
const TRADE_ITEM_STATUS_TO_DV: Record<string, number> = {
  open:   936880000,
  closed: 936880001,
}

/**
 * Map GateLockStatus to Dataverse picklist.
 */
const GATE_LOCK_TO_DV: Record<string, number> = {
  unlocked:  936880000,
  soft_lock: 936880001,
  hard_lock: 936880002,
}


// ─── Mobilization mutations ───────────────────────────────────

/**
 * Create a new mobilization in the given gate for the given trade.
 */
export async function createMobilization(
  payload: CreateMobilizationPayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (IS_MOCK) {
    revalidatePath(projectPath(payload.projectId))
    return { ok: true }
  }

  try {
    const body: Record<string, unknown> = {
      cr6cd_why:           payload.why,
      cr6cd_startoffset:   payload.startOffset,
      cr6cd_durationdays:  payload.duration,
      rlh_status:          936880000, // draft
      // Navigation property binds (lookup fields)
      'cr6cd_project@odata.bind':      `/cr6cd_projects(${payload.projectId})`,
      'cr6cd_buildphase@odata.bind':   `/cr6cd_buildphases(${payload.gateId})`,
      'rlh_projecttrade@odata.bind':   `/rlh_projecttrades(${payload.projectTradeId})`,
    }

    const res = await dvFetch('cr6cd_mobilizations', {
      method:  'POST',
      body:    JSON.stringify(body),
      headers: {
        Prefer: 'return=representation',
        'Content-Type': 'application/json',
      },
    })

    const json = await res.json() as { cr6cd_mobilizationid: string }
    revalidatePath(projectPath(payload.projectId))
    return { ok: true, id: json.cr6cd_mobilizationid }
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
    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    const body: Record<string, unknown> = {}

    if (payload.why !== undefined)          body.cr6cd_why          = payload.why
    if (payload.startOffset !== undefined)  body.cr6cd_startoffset  = payload.startOffset
    if (payload.duration !== undefined)     body.cr6cd_durationdays = payload.duration
    if (payload.status !== undefined)       body.rlh_status         = MOB_STATUS_TO_DV[payload.status]
    if (payload.gateId !== undefined)       body['cr6cd_buildphase@odata.bind'] = `/cr6cd_buildphases(${payload.gateId})`
    if (payload.projectTradeId !== undefined) body['rlh_projecttrade@odata.bind'] = `/rlh_projecttrades(${payload.projectTradeId})`

    // Only PATCH if there is something to patch
    if (Object.keys(body).length > 0) {
      await dvFetch(`cr6cd_mobilizations(${payload.id})`, {
        method: 'PATCH',
        body:   JSON.stringify(body),
      })
    }

    // Replace steps (TradeItems) if provided
    if (payload.steps !== undefined) {
      await replaceTradeItems(payload.id, payload.steps)
    }

    // Replace markers if provided
    if (payload.markers !== undefined) {
      await replaceMobilizationMarkers(payload.id, payload.markers)
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
    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    // Delete child trade items first (in case cascade isn't set)
    const tradeItemsRes = await dvFetch(
      `rlh_tradeitems?$select=rlh_tradeitemid&$filter=_rlh_mobilization_value eq '${mobilizationId}'`
    )
    const tradeItems = (await tradeItemsRes.json()) as { value: { rlh_tradeitemid: string }[] }
    await Promise.all(
      tradeItems.value.map(ti =>
        dvFetch(`rlh_tradeitems(${ti.rlh_tradeitemid})`, { method: 'DELETE' })
      )
    )

    // Delete child markers
    const markersRes = await dvFetch(
      `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid&$filter=_cr6cd_mobilization_value eq '${mobilizationId}'`
    )
    const markers = (await markersRes.json()) as { value: { cr6cd_mobilizationmarkersid: string }[] }
    await Promise.all(
      markers.value.map(m =>
        dvFetch(`cr6cd_mobilizationmarkerses(${m.cr6cd_mobilizationmarkersid})`, { method: 'DELETE' })
      )
    )

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


// ─── Child record helpers ─────────────────────────────────────
// These are internal helpers — not exported as server actions.
// They are called by updateMobilization.

/**
 * Replace all trade items for a mobilization.
 * Strategy: delete existing, then recreate in order.
 * This is simpler than diffing for now.
 */
async function replaceTradeItems(
  mobilizationId: string,
  steps: Omit<TradeItem, 'mobilizationId'>[]
): Promise<void> {
  // 1. Fetch existing
  const res = await dvFetch(
    `rlh_tradeitems?$select=rlh_tradeitemid&$filter=_rlh_mobilization_value eq '${mobilizationId}'`
  )
  const existing = (await res.json()) as { value: { rlh_tradeitemid: string }[] }

  // 2. Delete all existing
  await Promise.all(
    existing.value.map(ti =>
      dvFetch(`rlh_tradeitems(${ti.rlh_tradeitemid})`, { method: 'DELETE' })
    )
  )

  // 3. Create in order
  for (const step of steps) {
    const body: Record<string, unknown> = {
      rlh_name:      step.name,
      rlh_sortorder: step.sortOrder,
      'rlh_mobilization@odata.bind': `/cr6cd_mobilizations(${mobilizationId})`,
    }
    if (step.notes !== undefined)  body.rlh_notes  = step.notes
    if (step.type !== undefined)   body.rlh_type   = TRADE_ITEM_TYPE_TO_DV[step.type]
    if (step.status !== undefined) body.rlh_status = TRADE_ITEM_STATUS_TO_DV[step.status]

    await dvFetch('rlh_tradeitems', {
      method: 'POST',
      body:   JSON.stringify(body),
    })
  }
}

/**
 * Replace all markers for a mobilization.
 * Same delete-all-then-recreate strategy.
 */
async function replaceMobilizationMarkers(
  mobilizationId: string,
  markers: Omit<MobilizationMarker, 'mobilizationId'>[]
): Promise<void> {
  // 1. Fetch existing
  const res = await dvFetch(
    `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid&$filter=_cr6cd_mobilization_value eq '${mobilizationId}'`
  )
  const existing = (await res.json()) as { value: { cr6cd_mobilizationmarkersid: string }[] }

  // 2. Delete all existing
  await Promise.all(
    existing.value.map(m =>
      dvFetch(`cr6cd_mobilizationmarkerses(${m.cr6cd_mobilizationmarkersid})`, { method: 'DELETE' })
    )
  )

  // 3. Create new markers
  for (const marker of markers) {
    const body: Record<string, unknown> = {
      cr6cd_name:     marker.label,
      rlh_position:   marker.position,
      'cr6cd_mobilization@odata.bind': `/cr6cd_mobilizations(${mobilizationId})`,
    }
    if (marker.notes !== undefined) body.cr6cd_notes = marker.notes

    await dvFetch('cr6cd_mobilizationmarkerses', {
      method: 'POST',
      body:   JSON.stringify(body),
    })
  }
}
