// ============================================================
// Dataverse Queries — Scope Details
// ============================================================
// Dataverse table: rlh_scopedetails (new)
// ============================================================

import { dvGet } from '../client'
import type { ScopeDetail, ScopeDetailType } from '@/types/database'

const DETAIL_TYPE_MAP: Record<number, ScopeDetailType> = {
  936880000: 'specification',
  936880001: 'coordination',
  936880002: 'note',
  936880003: 'dimension',
}

interface DvScopeDetail {
  rlh_scopedetailid: string
  _rlh_project_value: string
  rlh_content: string
  rlh_detailtype?: number
  rlh_speccode?: string
  _rlh_space_value?: string
  _rlh_tradetype_value?: string
  _rlh_costcode_value?: string
  rlh_notes?: string
  createdon?: string
}

function toScopeDetail(dv: DvScopeDetail): ScopeDetail {
  return {
    id: dv.rlh_scopedetailid,
    projectId: dv._rlh_project_value,
    content: dv.rlh_content,
    detailType: DETAIL_TYPE_MAP[dv.rlh_detailtype ?? 936880000] ?? 'specification',
    specCode: dv.rlh_speccode,
    spaceId: dv._rlh_space_value,
    tradeTypeId: dv._rlh_tradetype_value,
    costCodeId: dv._rlh_costcode_value,
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
  }
}

export async function getScopeDetails(projectId: string): Promise<ScopeDetail[]> {
  const res = await dvGet<{ value: DvScopeDetail[] }>(
    `rlh_scopedetails?$select=rlh_scopedetailid,_rlh_project_value,rlh_content,rlh_detailtype,rlh_speccode,_rlh_space_value,_rlh_tradetype_value,_rlh_costcode_value,rlh_notes,createdon&$filter=_rlh_project_value eq '${projectId}'&$orderby=createdon desc`
  )
  return res.value.map(toScopeDetail)
}
