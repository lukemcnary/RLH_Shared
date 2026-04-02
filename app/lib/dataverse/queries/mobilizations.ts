// ============================================================
// Dataverse Queries — Mobilizations
// ============================================================
// Dataverse table: cr6cd_mobilizations
// Current compatibility fields on the mobilization row:
//   - cr6cd_stepsjson
//   - cr6cd_markersjson
// RLH_Shared keeps reading those values for the compatibility-shaped
// sequencer bundle, but the projector derives runtime steps from
// tradeScopes instead of trusting embedded step JSON.
// ============================================================

import { dvGet } from '../client'
import type {
  Mobilization,
  MobilizationMarker,
  ProjectTrade,
  TradeItem,
} from '@/types/database'
import {
  type DvMobilization,
  type DvMobilizationMarker,
  type DvTradeItem,
  toMobilizationMarker,
  toMobilization,
  toTradeItem,
} from '../mappers'

function buildLookupFilter(ids: string[], fields: string[]) {
  return ids
    .flatMap((id) => fields.map((field) => `${field} eq guid'${id}'`))
    .join(' or ')
}

function groupByMobilization<T extends { mobilizationId: string }>(items: T[]) {
  const grouped = new Map<string, T[]>()

  for (const item of items) {
    const existing = grouped.get(item.mobilizationId) ?? []
    existing.push(item)
    grouped.set(item.mobilizationId, existing)
  }

  return grouped
}

export async function getMobilizations(
  projectId: string,
  projectTradesById: Map<string, ProjectTrade> = new Map(),
): Promise<Mobilization[]> {
  const mobRes = await dvGet<{ value: DvMobilization[] }>(
    `cr6cd_mobilizations?$select=cr6cd_mobilizationid,cr6cd_durationdays,cr6cd_basedurationdays,cr6cd_startoffset,cr6cd_notes,cr6cd_why,cr6cd_stepsjson,cr6cd_markersjson,cr6cd_relocatedscopejson,cr6cd_displayorder,cr6cd_newcolumn,_cr6cd_trade_value,_cr6cd_projecttrade_value,_cr6cd_project_value,_cr6cd_buildphase_value&$filter=_cr6cd_project_value eq guid'${projectId}'&$orderby=cr6cd_startoffset`
  )

  const mobilizationIds = mobRes.value
    .map((mobilization) => mobilization.cr6cd_mobilizationid ?? mobilization.cr6cd_mobilizationsid)
    .filter((id): id is string => Boolean(id))

  let stepsByMobilization = new Map<string, TradeItem[]>()
  let markersByMobilization = new Map<string, MobilizationMarker[]>()

  if (mobilizationIds.length > 0) {
    try {
      const tradeItemFilter = buildLookupFilter(mobilizationIds, [
        '_rlh_mobilization_value',
        '_cr6cd_mobilizationsid_value',
      ])
      const markerFilter = buildLookupFilter(mobilizationIds, [
        '_cr720_mobilization_value',
        '_cr6cd_mobilization_value',
        '_cr6cd_mobilizationsid_value',
      ])

      const [tradeItemRes, markerRes] = await Promise.all([
        dvGet<{ value: DvTradeItem[] }>(
          `rlh_tradeitems?$select=rlh_tradeitemid,_rlh_mobilization_value,_cr6cd_mobilizationsid_value,rlh_name,rlh_text,rlh_newcolumn,rlh_notes,rlh_sortorder,rlh_type,rlh_status&$filter=${tradeItemFilter}&$orderby=rlh_sortorder`
        ),
        dvGet<{ value: DvMobilizationMarker[] }>(
          `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid,_cr720_mobilization_value,_cr6cd_mobilizationsid_value,cr6cd_name,cr6cd_newcolumn,cr720_notes,cr6cd_notes,cr6cd_position,rlh_position&$filter=${markerFilter}`
        ),
      ])

      stepsByMobilization = groupByMobilization(tradeItemRes.value.map(toTradeItem))
      markersByMobilization = groupByMobilization(markerRes.value.map(toMobilizationMarker))
    } catch (error) {
      console.warn('[getMobilizations] compatibility child fetch failed', error)
    }
  }

  return mobRes.value.map((mobilization) => {
    const mobilizationId = mobilization.cr6cd_mobilizationid ?? mobilization.cr6cd_mobilizationsid ?? ''

    return toMobilization(
      mobilization,
      projectTradesById.get(mobilization._cr6cd_projecttrade_value ?? ''),
      stepsByMobilization.get(mobilizationId) ?? [],
      markersByMobilization.get(mobilizationId) ?? [],
    )
  })
}
