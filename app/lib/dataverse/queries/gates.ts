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

export async function getGates(projectId?: string): Promise<Gate[]> {
  // Build phases are global (not project-scoped) in the current Dataverse schema.
  // The projectId parameter is accepted for forward compatibility but currently ignored.
  const res = await dvGet<{ value: DvBuildPhase[] }>(
    `cr6cd_buildphases?$select=cr6cd_buildphaseid,cr6cd_buildphasename,cr6cd_sequenceorder,cr6cd_description&$orderby=cr6cd_sequenceorder`
  )
  return res.value.map(toGate)
}
