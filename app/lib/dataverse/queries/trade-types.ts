// ============================================================
// Dataverse Queries — Trade Types
// ============================================================
// Dataverse table: cr6cd_trades
// ============================================================

import { dvGet } from '../client'
import type { TradeType } from '@/types/database'
import { type DvTrade, toTradeType } from '../mappers'

export async function getTradeTypes(): Promise<TradeType[]> {
  const res = await dvGet<{ value: DvTrade[] }>(
    'cr6cd_trades?$select=cr6cd_tradeid,cr6cd_tradename,cr6cd_tradecode&$orderby=cr6cd_tradename'
  )
  return res.value.map(toTradeType)
}
