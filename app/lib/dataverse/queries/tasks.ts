// ============================================================
// Dataverse Queries — Action Items (`rlh_tasks`)
// ============================================================
// Dataverse table: rlh_tasks (new)
// ============================================================

import { dvGet } from '../client'
import type { Task } from '@/types/database'
import { type DvTask, toTask } from '../mappers'

export async function getTasks(projectId: string): Promise<Task[]> {
  const res = await dvGet<{ value: DvTask[] }>(
    `rlh_tasks?$select=rlh_taskid,_rlh_project_value,_rlh_mobilization_value,rlh_ismarker,rlh_name,rlh_description,rlh_status,_rlh_assignee_value,rlh_duedate,rlh_completeddate,_rlh_tradetype_value,createdon&$filter=_rlh_project_value eq '${projectId}'&$orderby=createdon desc`
  )
  return res.value.map(toTask)
}
