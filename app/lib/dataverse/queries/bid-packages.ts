// ============================================================
// Dataverse Queries — Bid Packages
// ============================================================
// Dataverse table: rlh_bidpackages (new)
// ============================================================

import { dvGet } from '../client'
import type { BidPackage, BidPackageStatus } from '@/types/database'

const STATUS_MAP: Record<number, BidPackageStatus> = {
  936880000: 'draft',
  936880001: 'sent',
  936880002: 'reviewing',
  936880003: 'awarded',
}

interface DvBidPackage {
  rlh_bidpackageid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_status?: number
  _rlh_tradetype_value?: string
  rlh_description?: string
  rlh_duedate?: string
  rlh_sentdate?: string
  rlh_awardeddate?: string
  _rlh_awardedcompany_value?: string
  rlh_notes?: string
  createdon?: string
  modifiedon?: string
}

function toBidPackage(dv: DvBidPackage): BidPackage {
  return {
    id: dv.rlh_bidpackageid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    status: STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'draft',
    tradeTypeId: dv._rlh_tradetype_value,
    description: dv.rlh_description,
    dueDate: dv.rlh_duedate?.slice(0, 10),
    sentDate: dv.rlh_sentdate?.slice(0, 10),
    awardedDate: dv.rlh_awardeddate?.slice(0, 10),
    awardedCompanyId: dv._rlh_awardedcompany_value,
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export async function getBidPackages(projectId: string): Promise<BidPackage[]> {
  const res = await dvGet<{ value: DvBidPackage[] }>(
    `rlh_bidpackages?$select=rlh_bidpackageid,_rlh_project_value,rlh_name,rlh_status,_rlh_tradetype_value,rlh_description,rlh_duedate,rlh_sentdate,rlh_awardeddate,_rlh_awardedcompany_value,rlh_notes,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_name`
  )
  return res.value.map(toBidPackage)
}
