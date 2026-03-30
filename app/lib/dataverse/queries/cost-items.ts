// ============================================================
// Dataverse Queries — Cost Items
// ============================================================
// Dataverse table: rlh_costitems (new)
// ============================================================

import { dvGet } from '../client'
import type { CostItem, CostItemStatus, CostItemSource } from '@/types/database'

const STATUS_MAP: Record<number, CostItemStatus> = {
  936880000: 'pending',
  936880001: 'scoped',
  936880002: 'in_bid',
  936880003: 'awarded',
  936880004: 'in_progress',
  936880005: 'complete',
}

const SOURCE_MAP: Record<number, CostItemSource> = {
  936880000: 'manual',
  936880001: 'from_scope_item',
  936880002: 'from_ai',
}

interface DvCostItem {
  rlh_costitemid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_description?: string
  rlh_status?: number
  rlh_source?: number
  rlh_estimatelow?: number
  rlh_estimatehigh?: number
  rlh_awardedamount?: number
  _rlh_tradetype_value?: string
  _rlh_costcode_value?: string
  _rlh_space_value?: string
  _rlh_bidpackage_value?: string
  rlh_notes?: string
  rlh_sortorder?: number
  createdon?: string
  modifiedon?: string
}

function toCostItem(dv: DvCostItem): CostItem {
  return {
    id: dv.rlh_costitemid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    description: dv.rlh_description,
    status: STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'pending',
    source: SOURCE_MAP[dv.rlh_source ?? 936880000] ?? 'manual',
    estimateLow: dv.rlh_estimatelow,
    estimateHigh: dv.rlh_estimatehigh,
    awardedAmount: dv.rlh_awardedamount,
    tradeTypeId: dv._rlh_tradetype_value,
    costCodeId: dv._rlh_costcode_value,
    spaceId: dv._rlh_space_value,
    bidPackageId: dv._rlh_bidpackage_value,
    notes: dv.rlh_notes,
    sortOrder: dv.rlh_sortorder,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export async function getCostItems(projectId: string): Promise<CostItem[]> {
  const res = await dvGet<{ value: DvCostItem[] }>(
    `rlh_costitems?$select=rlh_costitemid,_rlh_project_value,rlh_name,rlh_description,rlh_status,rlh_source,rlh_estimatelow,rlh_estimatehigh,rlh_awardedamount,_rlh_tradetype_value,_rlh_costcode_value,_rlh_space_value,_rlh_bidpackage_value,rlh_notes,rlh_sortorder,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_sortorder`
  )
  return res.value.map(toCostItem)
}
