// ============================================================
// Dataverse Queries — Cost Items
// ============================================================
// Dataverse table: rlh_costitems (new)
// ============================================================

import { dvGet } from '../client'
import type { CostItem } from '@/types/database'
import { type DvCostItem, toCostItem } from '../mappers'

export async function getCostItems(projectId: string): Promise<CostItem[]> {
  const res = await dvGet<{ value: DvCostItem[] }>(
    `rlh_costitems?$select=rlh_costitemid,_rlh_project_value,rlh_name,rlh_description,rlh_status,rlh_source,rlh_estimatelow,rlh_estimatehigh,rlh_awardedamount,_rlh_tradetype_value,_rlh_costcode_value,_rlh_space_value,_rlh_bidpackage_value,rlh_notes,rlh_sortorder,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_sortorder`
  )
  return res.value.map(toCostItem)
}
