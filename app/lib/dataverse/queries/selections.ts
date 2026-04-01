// ============================================================
// Dataverse Queries — Selections
// ============================================================
// Dataverse table: rlh_selections (new)
// ============================================================

import { dvGet } from '../client'
import type { Selection } from '@/types/database'
import { type DvSelection, toSelection } from '../mappers'

export async function getSelections(projectId: string): Promise<Selection[]> {
  const res = await dvGet<{ value: DvSelection[] }>(
    `rlh_selections?$select=rlh_selectionid,_rlh_project_value,rlh_name,rlh_category,rlh_status,rlh_procurementresponsibility,rlh_speccode,rlh_manufacturer,rlh_model,rlh_finish,rlh_color,rlh_quantity,rlh_unit,rlh_unitcost,rlh_totalcost,rlh_leadtimedays,rlh_duedate,rlh_ordereddate,rlh_delivereddate,_rlh_tradetype_value,_rlh_space_value,_rlh_costitem_value,_rlh_vendorcompany_value,rlh_notes,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_name`
  )
  return res.value.map(toSelection)
}
