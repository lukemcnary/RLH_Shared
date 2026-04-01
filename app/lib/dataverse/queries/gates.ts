// ============================================================
// Dataverse Queries — Gates (Build Phases)
// ============================================================
// Dataverse table: cr6cd_buildphases
// New fields: rlh_lockstatus, rlh_workingwindowstart, rlh_workingwindowend,
//             rlh_declaredwindowstart, rlh_declaredwindowend
// ============================================================

import { dvGet } from '../client'
import type { Gate } from '@/types/database'
import { type DvBuildPhase, toGate } from '../mappers'

export async function getGates(projectId: string): Promise<Gate[]> {
  const res = await dvGet<{ value: DvBuildPhase[] }>(
    `cr6cd_buildphases?$select=cr6cd_buildphaseid,cr6cd_name,cr6cd_sortorder,cr6cd_description,rlh_lockstatus,rlh_workingwindowstart,rlh_workingwindowend,rlh_declaredwindowstart,rlh_declaredwindowend,_cr6cd_projectid_value&$filter=_cr6cd_projectid_value eq '${projectId}'&$orderby=cr6cd_sortorder`
  )
  return res.value.map(toGate)
}
