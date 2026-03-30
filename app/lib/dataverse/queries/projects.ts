// ============================================================
// Dataverse Queries — Projects
// ============================================================
// Dataverse table: cr6cd_projects
// New fields added by shared app:
// rlh_address, rlh_status, _rlh_client_value, rlh_sharepointsiteurl, rlh_sharepointsiteid
// ============================================================

import { dvGet } from '../client'
import type { Project, ProjectStatus } from '@/types/database'

// Status picklist (Trevor's 936880000 base)
const STATUS_MAP: Record<number, ProjectStatus> = {
  936880000: 'planning',
  936880001: 'active',
  936880002: 'complete',
  936880003: 'on_hold',
}

interface DvProject {
  cr6cd_projectid: string
  cr6cd_name: string
  rlh_address?: string
  cr6cd_startdate?: string
  cr6cd_completiondate?: string
  rlh_status?: number
  _rlh_client_value?: string
  rlh_sharepointsiteurl?: string
  rlh_sharepointsiteid?: string
}

function toProject(dv: DvProject): Project {
  return {
    id: dv.cr6cd_projectid,
    name: dv.cr6cd_name,
    address: dv.rlh_address,
    startDate: dv.cr6cd_startdate?.slice(0, 10),
    completionDate: dv.cr6cd_completiondate?.slice(0, 10),
    status: STATUS_MAP[dv.rlh_status ?? 936880001] ?? 'active',
    clientId: dv._rlh_client_value,
    sharePointSiteUrl: dv.rlh_sharepointsiteurl,
    sharePointSiteId: dv.rlh_sharepointsiteid,
  }
}

export async function getProjects(): Promise<Project[]> {
  const res = await dvGet<{ value: DvProject[] }>(
    'cr6cd_projects?$select=cr6cd_projectid,cr6cd_name,rlh_address,cr6cd_startdate,cr6cd_completiondate,rlh_status&$orderby=cr6cd_name'
  )
  return res.value.map(toProject)
}

export async function getProject(projectId: string): Promise<Project | null> {
  const res = await dvGet<{ value: DvProject[] }>(
    `cr6cd_projects?$select=cr6cd_projectid,cr6cd_name,rlh_address,cr6cd_startdate,cr6cd_completiondate,rlh_status,_rlh_client_value,rlh_sharepointsiteurl,rlh_sharepointsiteid&$filter=cr6cd_projectid eq '${projectId}'`
  )
  return res.value[0] ? toProject(res.value[0]) : null
}
