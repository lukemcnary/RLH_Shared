// ============================================================
// Dataverse Queries — Action Items (`rlh_tasks`)
// ============================================================
// Dataverse table: rlh_tasks (new)
// ============================================================

import { dvGet } from '../client'
import type { Task, TaskStatus } from '@/types/database'

const STATUS_MAP: Record<number, TaskStatus> = {
  936880000: 'open',
  936880001: 'in_progress',
  936880002: 'complete',
  936880003: 'blocked',
}

interface DvTask {
  rlh_taskid: string
  _rlh_project_value: string
  _rlh_mobilization_value?: string
  rlh_ismarker?: boolean
  rlh_name: string
  rlh_description?: string
  rlh_status?: number
  _rlh_assignee_value?: string
  rlh_duedate?: string
  rlh_completeddate?: string
  _rlh_tradetype_value?: string
  createdon?: string
}

function toTask(dv: DvTask): Task {
  return {
    id: dv.rlh_taskid,
    projectId: dv._rlh_project_value,
    mobilizationId: dv._rlh_mobilization_value,
    isMarker: dv.rlh_ismarker ?? false,
    name: dv.rlh_name,
    description: dv.rlh_description,
    status: STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'open',
    assigneeContactId: dv._rlh_assignee_value,
    dueDate: dv.rlh_duedate?.slice(0, 10),
    completedDate: dv.rlh_completeddate?.slice(0, 10),
    tradeTypeId: dv._rlh_tradetype_value,
    createdAt: dv.createdon,
  }
}

export async function getTasks(projectId: string): Promise<Task[]> {
  const res = await dvGet<{ value: DvTask[] }>(
    `rlh_tasks?$select=rlh_taskid,_rlh_project_value,_rlh_mobilization_value,rlh_ismarker,rlh_name,rlh_description,rlh_status,_rlh_assignee_value,rlh_duedate,rlh_completeddate,_rlh_tradetype_value,createdon&$filter=_rlh_project_value eq '${projectId}'&$orderby=createdon desc`
  )
  return res.value.map(toTask)
}
