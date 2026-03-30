// ============================================================
// Dataverse Queries — Mobilizations
// ============================================================
// Dataverse table: cr6cd_mobilizations
// New field: rlh_status
// Related: rlh_tradeitems (steps), cr6cd_mobilizationmarkerses (markers)
// ============================================================

import { dvGet } from '../client'
import type { Mobilization, MobilizationStatus, TradeItem, MobilizationMarker } from '@/types/database'

const STATUS_MAP: Record<number, MobilizationStatus> = {
  936880000: 'draft',
  936880001: 'confirmed',
  936880002: 'in_progress',
  936880003: 'complete',
}

interface DvMobilization {
  cr6cd_mobilizationsid: string
  _cr6cd_projectid_value: string
  _cr6cd_buildphaseid_value: string
  _rlh_projecttradeid_value: string
  cr6cd_why?: string
  cr6cd_startoffset?: number
  cr6cd_durationdays?: number
  rlh_status?: number
  // Expanded trade via project trade
  rlh_projecttradeid?: {
    rlh_projecttradeid: string
    cr6cd_tradeid?: {
      cr6cd_tradeid: string
      cr6cd_name: string
      cr6cd_tradecode?: string
      cr6cd_color?: string
    }
  }
}

interface DvTradeItem {
  rlh_tradeitemid: string
  _cr6cd_mobilizationsid_value: string
  rlh_name: string
  rlh_notes?: string
  rlh_sortorder?: number
}

interface DvMobilizationMarker {
  cr6cd_mobilizationmarkersid: string
  _cr6cd_mobilizationsid_value: string
  cr6cd_name: string
  cr6cd_notes?: string
  cr6cd_position?: number
}

function toMobilization(dv: DvMobilization, steps: TradeItem[], markers: MobilizationMarker[]): Mobilization {
  const dvTrade = dv.rlh_projecttradeid?.cr6cd_tradeid
  const tradeType = dvTrade
    ? { id: dvTrade.cr6cd_tradeid, name: dvTrade.cr6cd_name, code: dvTrade.cr6cd_tradecode ?? '', color: dvTrade.cr6cd_color }
    : { id: dv._rlh_projecttradeid_value, name: '(unknown)', code: '???' }

  return {
    id: dv.cr6cd_mobilizationsid,
    projectId: dv._cr6cd_projectid_value,
    gateId: dv._cr6cd_buildphaseid_value,
    projectTradeId: dv._rlh_projecttradeid_value,
    tradeType,
    why: dv.cr6cd_why ?? '',
    status: STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'draft',
    startOffset: dv.cr6cd_startoffset ?? 0,
    duration: dv.cr6cd_durationdays ?? 5,
    steps,
    markers,
  }
}

export async function getMobilizations(projectId: string): Promise<Mobilization[]> {
  const [mobRes, stepRes, markerRes] = await Promise.all([
    dvGet<{ value: DvMobilization[] }>(
      `cr6cd_mobilizations?$select=cr6cd_mobilizationsid,_cr6cd_projectid_value,_cr6cd_buildphaseid_value,_rlh_projecttradeid_value,cr6cd_why,cr6cd_startoffset,cr6cd_durationdays,rlh_status&$expand=rlh_projecttradeid($select=rlh_projecttradeid;$expand=cr6cd_tradeid($select=cr6cd_tradeid,cr6cd_name,cr6cd_tradecode,cr6cd_color))&$filter=_cr6cd_projectid_value eq '${projectId}'`
    ),
    dvGet<{ value: DvTradeItem[] }>(
      `rlh_tradeitems?$select=rlh_tradeitemid,_cr6cd_mobilizationsid_value,rlh_name,rlh_notes,rlh_sortorder&$filter=_cr6cd_projectid_value eq '${projectId}'&$orderby=rlh_sortorder`
    ),
    dvGet<{ value: DvMobilizationMarker[] }>(
      `cr6cd_mobilizationmarkerses?$select=cr6cd_mobilizationmarkersid,_cr6cd_mobilizationsid_value,cr6cd_name,cr6cd_notes,cr6cd_position&$filter=_cr6cd_projectid_value eq '${projectId}'`
    ),
  ])

  // Index steps and markers by mobilization id
  const stepsByMob = new Map<string, TradeItem[]>()
  for (const s of stepRes.value) {
    const mobId = s._cr6cd_mobilizationsid_value
    if (!stepsByMob.has(mobId)) stepsByMob.set(mobId, [])
    stepsByMob.get(mobId)!.push({
      id: s.rlh_tradeitemid,
      mobilizationId: mobId,
      name: s.rlh_name,
      notes: s.rlh_notes,
      sortOrder: s.rlh_sortorder ?? 0,
    })
  }

  const markersByMob = new Map<string, MobilizationMarker[]>()
  for (const m of markerRes.value) {
    const mobId = m._cr6cd_mobilizationsid_value
    if (!markersByMob.has(mobId)) markersByMob.set(mobId, [])
    markersByMob.get(mobId)!.push({
      id: m.cr6cd_mobilizationmarkersid,
      mobilizationId: mobId,
      label: m.cr6cd_name,
      notes: m.cr6cd_notes,
      position: m.cr6cd_position ?? 0.5,
    })
  }

  return mobRes.value.map(dv =>
    toMobilization(dv, stepsByMob.get(dv.cr6cd_mobilizationsid) ?? [], markersByMob.get(dv.cr6cd_mobilizationsid) ?? [])
  )
}
