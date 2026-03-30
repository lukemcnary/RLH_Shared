// ============================================================
// Dataverse Queries — Gates (Build Phases)
// ============================================================
// Dataverse table: cr6cd_buildphases
// New fields: rlh_lockstatus, rlh_workingwindowstart, rlh_workingwindowend,
//             rlh_declaredwindowstart, rlh_declaredwindowend
// ============================================================

import { dvGet } from '../client'
import type { Gate, GateLockStatus } from '@/types/database'

const LOCK_MAP: Record<number, GateLockStatus> = {
  936880000: 'unlocked',
  936880001: 'soft_lock',
  936880002: 'hard_lock',
}

interface DvBuildPhase {
  cr6cd_buildphaseid: string
  cr6cd_name: string
  cr6cd_sortorder?: number
  cr6cd_description?: string
  rlh_lockstatus?: number
  rlh_workingwindowstart?: string
  rlh_workingwindowend?: string
  rlh_declaredwindowstart?: string
  rlh_declaredwindowend?: string
  _cr6cd_projectid_value: string
}

function toGate(dv: DvBuildPhase): Gate {
  return {
    id: dv.cr6cd_buildphaseid,
    projectId: dv._cr6cd_projectid_value,
    name: dv.cr6cd_name,
    order: dv.cr6cd_sortorder ?? 0,
    description: dv.cr6cd_description,
    lockStatus: LOCK_MAP[dv.rlh_lockstatus ?? 936880000] ?? 'unlocked',
    workingWindowStart: dv.rlh_workingwindowstart?.slice(0, 10),
    workingWindowEnd: dv.rlh_workingwindowend?.slice(0, 10),
    declaredWindowStart: dv.rlh_declaredwindowstart?.slice(0, 10),
    declaredWindowEnd: dv.rlh_declaredwindowend?.slice(0, 10),
  }
}

export async function getGates(projectId: string): Promise<Gate[]> {
  const res = await dvGet<{ value: DvBuildPhase[] }>(
    `cr6cd_buildphases?$select=cr6cd_buildphaseid,cr6cd_name,cr6cd_sortorder,cr6cd_description,rlh_lockstatus,rlh_workingwindowstart,rlh_workingwindowend,rlh_declaredwindowstart,rlh_declaredwindowend,_cr6cd_projectid_value&$filter=_cr6cd_projectid_value eq '${projectId}'&$orderby=cr6cd_sortorder`
  )
  return res.value.map(toGate)
}
