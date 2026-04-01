// ============================================================
// Dataverse Queries — Cost Codes
// ============================================================
// Dataverse table: rlh_costcodes (new)
// ============================================================

import { dvGet } from '../client'
import type { CostCode } from '@/types/database'
import { type DvCostCode, toCostCode } from '../mappers'

export async function getCostCodes(): Promise<CostCode[]> {
  const res = await dvGet<{ value: DvCostCode[] }>(
    'rlh_costcodes?$select=rlh_costcodeid,rlh_code,rlh_name,_rlh_parent_value,_rlh_tradetype_value,rlh_isscope,rlh_sortorder&$orderby=rlh_sortorder'
  )
  return res.value.map(toCostCode)
}
