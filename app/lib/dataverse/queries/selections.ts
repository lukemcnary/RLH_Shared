// ============================================================
// Dataverse Queries — Selections
// ============================================================
// Dataverse table: rlh_selections (new)
// ============================================================

import { dvGet } from '../client'
import type { Selection, SelectionStatus, SelectionProcurement } from '@/types/database'

const STATUS_MAP: Record<number, SelectionStatus> = {
  936880000: 'pending',
  936880001: 'specified',
  936880002: 'approved',
  936880003: 'ordered',
  936880004: 'delivered',
  936880005: 'installed',
}

const PROCUREMENT_MAP: Record<number, SelectionProcurement> = {
  936880000: 'builder',
  936880001: 'trade',
  936880002: 'vendor',
}

interface DvSelection {
  rlh_selectionid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_category?: string
  rlh_status?: number
  rlh_procurementresponsibility?: number
  rlh_speccode?: string
  rlh_manufacturer?: string
  rlh_model?: string
  rlh_finish?: string
  rlh_color?: string
  rlh_quantity?: number
  rlh_unit?: string
  rlh_unitcost?: number
  rlh_totalcost?: number
  rlh_leadtimedays?: number
  rlh_duedate?: string
  rlh_ordereddate?: string
  rlh_delivereddate?: string
  _rlh_tradetype_value?: string
  _rlh_space_value?: string
  _rlh_costitem_value?: string
  _rlh_vendorcompany_value?: string
  rlh_notes?: string
  createdon?: string
  modifiedon?: string
}

function toSelection(dv: DvSelection): Selection {
  return {
    id: dv.rlh_selectionid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    category: dv.rlh_category,
    status: STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'pending',
    procurementResponsibility: PROCUREMENT_MAP[dv.rlh_procurementresponsibility ?? 936880000] ?? 'builder',
    specCode: dv.rlh_speccode,
    manufacturer: dv.rlh_manufacturer,
    model: dv.rlh_model,
    finish: dv.rlh_finish,
    color: dv.rlh_color,
    quantity: dv.rlh_quantity,
    unit: dv.rlh_unit,
    unitCost: dv.rlh_unitcost,
    totalCost: dv.rlh_totalcost,
    leadTimeDays: dv.rlh_leadtimedays,
    dueDate: dv.rlh_duedate?.slice(0, 10),
    orderedDate: dv.rlh_ordereddate?.slice(0, 10),
    deliveredDate: dv.rlh_delivereddate?.slice(0, 10),
    tradeTypeId: dv._rlh_tradetype_value,
    spaceId: dv._rlh_space_value,
    costItemId: dv._rlh_costitem_value,
    vendorCompanyId: dv._rlh_vendorcompany_value,
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export async function getSelections(projectId: string): Promise<Selection[]> {
  const res = await dvGet<{ value: DvSelection[] }>(
    `rlh_selections?$select=rlh_selectionid,_rlh_project_value,rlh_name,rlh_category,rlh_status,rlh_procurementresponsibility,rlh_speccode,rlh_manufacturer,rlh_model,rlh_finish,rlh_color,rlh_quantity,rlh_unit,rlh_unitcost,rlh_totalcost,rlh_leadtimedays,rlh_duedate,rlh_ordereddate,rlh_delivereddate,_rlh_tradetype_value,_rlh_space_value,_rlh_costitem_value,_rlh_vendorcompany_value,rlh_notes,createdon,modifiedon&$filter=_rlh_project_value eq '${projectId}'&$orderby=rlh_name`
  )
  return res.value.map(toSelection)
}
