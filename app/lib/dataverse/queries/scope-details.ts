// ============================================================
// Dataverse Queries — Scope Details
// ============================================================
// Dataverse table: rlh_scopedetails (new)
// ============================================================

import { dvGet } from '../client'
import type { ScopeDetail } from '@/types/database'
import { type DvScopeDetail, toScopeDetail } from '../mappers'

export async function getScopeDetails(projectId: string): Promise<ScopeDetail[]> {
  const res = await dvGet<{ value: DvScopeDetail[] }>(
    `rlh_scopedetails?$select=rlh_scopedetailid,_rlh_project_value,rlh_content,rlh_detailtype,rlh_speccode,_rlh_space_value,_rlh_tradetype_value,_rlh_costcode_value,rlh_notes,createdon&$filter=_rlh_project_value eq '${projectId}'&$orderby=createdon desc`
  )
  return res.value.map(toScopeDetail)
}
