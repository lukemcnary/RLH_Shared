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
import type { Mobilization, ProjectTrade } from '@/types/database'
import {
  type DvMobilization,
  toMobilization,
} from '../mappers'

export async function getMobilizations(
  projectId: string,
  projectTradesById: Map<string, ProjectTrade> = new Map(),
): Promise<Mobilization[]> {
  const mobRes = await dvGet<{ value: DvMobilization[] }>(
    `cr6cd_mobilizations?$select=cr6cd_mobilizationid,cr6cd_durationdays,cr6cd_basedurationdays,cr6cd_startoffset,cr6cd_notes,cr6cd_why,cr6cd_stepsjson,cr6cd_markersjson,cr6cd_relocatedscopejson,cr6cd_displayorder,cr6cd_newcolumn,_cr6cd_trade_value,_cr6cd_projecttrade_value,_cr6cd_project_value,_cr6cd_buildphase_value&$filter=_cr6cd_project_value eq guid'${projectId}'&$orderby=cr6cd_startoffset`
  )

  return mobRes.value.map((mobilization) =>
    toMobilization(
      mobilization,
      projectTradesById.get(mobilization._cr6cd_projecttrade_value ?? ''),
    ),
  )
}
