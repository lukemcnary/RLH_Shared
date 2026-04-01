// ============================================================
// Dataverse Queries — Trade Scopes
// ============================================================
// Dataverse table: rlh_tradescopes
// Trevor compatibility table used to link scope records to
// project trades and, optionally, specific mobilizations.
// ============================================================

import { dvGet } from '../client'
import type { Mobilization, TradeScope } from '@/types/database'
import {
  type DvTradeScope,
  toTradeScope,
} from '../mappers'

export async function getTradeScopes(
  projectTradeIds: string[],
  mobilizationsById: Map<string, Mobilization> = new Map(),
): Promise<TradeScope[]> {
  if (projectTradeIds.length === 0) return []

  const validProjectTradeIds = new Set(projectTradeIds)
  const response = await dvGet<{ value: DvTradeScope[] }>(
    'rlh_tradescopes?$select=rlh_tradescopeid,rlh_newcolumn,rlh_externalid,rlh_notes,rlh_displayorder,_rlh_projecttrade_value,_rlh_partnerlookup_value,_rlh_mobilization_value'
  )

  return response.value
    .filter((tradeScope) => {
      const projectTradeId = tradeScope._rlh_projecttrade_value ?? ''
      return validProjectTradeIds.has(projectTradeId)
    })
    .map((tradeScope) => {
      const mobilization = tradeScope._rlh_mobilization_value
        ? mobilizationsById.get(tradeScope._rlh_mobilization_value)
        : undefined

      return toTradeScope(tradeScope, mobilization?.gateId)
    })
    .sort((a, b) => {
      if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      }
      return a.name.localeCompare(b.name)
    })
}
