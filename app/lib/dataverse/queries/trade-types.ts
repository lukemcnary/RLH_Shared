// ============================================================
// Dataverse Queries — Trade Types
// ============================================================
// Dataverse table: cr6cd_trades
// ============================================================

import { dvGet } from '../client'
import type { TradeType } from '@/types/database'

interface DvTrade {
  cr6cd_tradeid: string
  cr6cd_name: string
  cr6cd_tradecode?: string
  cr6cd_color?: string
}

function toTradeType(dv: DvTrade): TradeType {
  return {
    id: dv.cr6cd_tradeid,
    name: dv.cr6cd_name,
    code: dv.cr6cd_tradecode ?? dv.cr6cd_name.slice(0, 3).toUpperCase(),
    color: dv.cr6cd_color,
  }
}

export async function getTradeTypes(): Promise<TradeType[]> {
  const res = await dvGet<{ value: DvTrade[] }>(
    'cr6cd_trades?$select=cr6cd_tradeid,cr6cd_name,cr6cd_tradecode,cr6cd_color&$orderby=cr6cd_name'
  )
  return res.value.map(toTradeType)
}
