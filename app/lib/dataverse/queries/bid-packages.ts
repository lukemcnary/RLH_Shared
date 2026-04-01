// ============================================================
// Dataverse Queries — Bid Packages
// ============================================================
// Dataverse table: rlh_bidpackages (new)
// ============================================================

import { dvGet } from '../client'
import type { BidPackage } from '@/types/database'
import { type DvBidPackage, toBidPackage } from '../mappers'

export async function getBidPackages(projectId: string): Promise<BidPackage[]> {
  const res = await dvGet<{ value: DvBidPackage[] }>(
    `rlh_bidpackages?$select=rlh_bidpackageid,_rlh_project_value,rlh_name,rlh_status,_rlh_tradetype_value,rlh_description,rlh_duedate,rlh_sentdate,rlh_awardeddate,_rlh_awardedcompany_value,rlh_notes,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_name`
  )
  return res.value.map(toBidPackage)
}
