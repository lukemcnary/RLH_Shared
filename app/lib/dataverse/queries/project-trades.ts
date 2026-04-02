// ============================================================
// Dataverse Queries — Project Trades
// ============================================================
// Dataverse table: rlh_projecttrades
// ============================================================

import { dvGet } from '../client'
import type { ProjectTrade } from '@/types/database'
import { getTradeTypes } from './trade-types'
import { type DvProjectTrade, toProjectTrade } from '../mappers'

export async function getProjectTrades(projectId: string): Promise<ProjectTrade[]> {
  const [res, tradeTypes] = await Promise.all([
    dvGet<{ value: DvProjectTrade[] }>(
      `rlh_projecttrades?$select=rlh_projecttradeid,rlh_externalid,rlh_newcolumn,_rlh_project_value,_rlh_trade_value,rlh_stage&$filter=_rlh_project_value eq '${projectId}'`
    ),
    getTradeTypes(),
  ])

  const tradeTypesById = new Map(tradeTypes.map((tradeType) => [tradeType.id, tradeType]))

  return res.value.map((projectTrade) => {
    const tradeTypeId = projectTrade._rlh_trade_value ?? projectTrade.rlh_externalid ?? ''
    return toProjectTrade(projectTrade, tradeTypesById.get(tradeTypeId))
  })
}
