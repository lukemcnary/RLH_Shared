// ============================================================
// Dataverse Queries — Projects
// ============================================================
// Dataverse table: cr6cd_projects
// New fields added by shared app:
// rlh_address, rlh_status, _rlh_client_value, rlh_sharepointsiteurl, rlh_sharepointsiteid
// ============================================================

import { dvGet } from '../client'
import type { Project } from '@/types/database'
import { type DvProject, toProject } from '../mappers'

export async function getProjects(): Promise<Project[]> {
  const res = await dvGet<{ value: DvProject[] }>(
    'cr6cd_projects?$select=cr6cd_projectid,cr6cd_projectname,cr6cd_location,cr6cd_startdate,cr6cd_enddate,cr6cd_status&$orderby=cr6cd_projectname'
  )
  return res.value.map(toProject)
}

export async function getProject(projectId: string): Promise<Project | null> {
  const res = await dvGet<{ value: DvProject[] }>(
    `cr6cd_projects?$select=cr6cd_projectid,cr6cd_projectname,cr6cd_location,cr6cd_startdate,cr6cd_enddate,cr6cd_status,cr6cd_description,cr6cd_gatedeclarationsjson,cr6cd_holidaysjson&$filter=cr6cd_projectid eq '${projectId}'`
  )
  return res.value[0] ? toProject(res.value[0]) : null
}
