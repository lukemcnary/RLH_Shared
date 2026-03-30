// ============================================================
// Dataverse Queries — Project Scope
// ============================================================
// Dataverse table: rlh_scopeitems (new)
// ============================================================

import { dvGet } from '../client'
import type { ScopeItem } from '@/types/database'

interface DvScopeItem {
  rlh_scopeitemid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_description?: string
  _rlh_tradetype_value?: string
  _rlh_costcode_value?: string
  rlh_notes?: string
  createdon?: string
  modifiedon?: string
}

function toScopeItem(dv: DvScopeItem): ScopeItem {
  return {
    id: dv.rlh_scopeitemid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    description: dv.rlh_description,
    tradeTypeId: dv._rlh_tradetype_value,
    costCodeId: dv._rlh_costcode_value,
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export async function getScopeItems(projectId: string): Promise<ScopeItem[]> {
  const res = await dvGet<{ value: DvScopeItem[] }>(
    `rlh_scopeitems?$select=rlh_scopeitemid,_rlh_project_value,rlh_name,rlh_description,_rlh_tradetype_value,_rlh_costcode_value,rlh_notes,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_name`
  )
  return res.value.map(toScopeItem)
}
