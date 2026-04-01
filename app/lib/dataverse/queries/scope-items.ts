// ============================================================
// Dataverse Queries — Project Scope
// ============================================================
// Dataverse table: rlh_scopeitems (new)
// ============================================================

import { dvGet } from '../client'
import type { ScopeItem } from '@/types/database'
import { type DvScopeItem, toScopeItem } from '../mappers'

export async function getScopeItems(projectId: string): Promise<ScopeItem[]> {
  const res = await dvGet<{ value: DvScopeItem[] }>(
    `rlh_scopeitems?$select=rlh_scopeitemid,_rlh_project_value,rlh_name,rlh_description,_rlh_tradetype_value,_rlh_costcode_value,rlh_notes,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_name`
  )
  return res.value.map(toScopeItem)
}
