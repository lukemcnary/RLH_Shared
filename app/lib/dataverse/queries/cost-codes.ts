// ============================================================
// Dataverse Queries — Cost Codes
// ============================================================
// Dataverse table: rlh_costcodes (new)
// ============================================================

import { dvGet } from '../client'
import type { CostCode } from '@/types/database'

interface DvCostCode {
  rlh_costcodeid: string
  rlh_code: string
  rlh_name: string
  _rlh_parent_value?: string
  _rlh_tradetype_value?: string
  rlh_isscope?: boolean
  rlh_sortorder?: number
}

function toCostCode(dv: DvCostCode): CostCode {
  return {
    id: dv.rlh_costcodeid,
    code: dv.rlh_code,
    fullCode: dv.rlh_code, // TODO: map from Dataverse full_code field when available
    name: dv.rlh_name,
    level: 3, // TODO: map from Dataverse level field when available
    parentId: dv._rlh_parent_value,
    tradeTypeId: dv._rlh_tradetype_value,
    isScope: dv.rlh_isscope,
    sortOrder: dv.rlh_sortorder,
  }
}

export async function getCostCodes(): Promise<CostCode[]> {
  const res = await dvGet<{ value: DvCostCode[] }>(
    'rlh_costcodes?$select=rlh_costcodeid,rlh_code,rlh_name,_rlh_parent_value,_rlh_tradetype_value,rlh_isscope,rlh_sortorder&$orderby=rlh_sortorder'
  )
  return res.value.map(toCostCode)
}
