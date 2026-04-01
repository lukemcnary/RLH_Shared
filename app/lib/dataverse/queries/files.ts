// ============================================================
// Dataverse Queries — Files
// ============================================================
// Dataverse tables:
//   rlh_files
//   rlh_filelinks
// ============================================================

import { dvGet } from '../client'
import type { ProjectFile, ProjectFileLink } from '@/types/database'
import {
  type DvProjectFile,
  type DvProjectFileLink,
  toProjectFile,
  toProjectFileLink,
} from '../mappers'

export async function getProjectFileReferences(projectId: string): Promise<ProjectFile[]> {
  const filesRes = await dvGet<{ value: DvProjectFile[] }>(
    `rlh_files?$select=rlh_fileid,rlh_filename,rlh_sharepointurl,rlh_filetype,rlh_filesize,rlh_notes,rlh_librarykey,rlh_sharepointsiteid,rlh_sharepointdriveid,rlh_sharepointitemid,createdon,modifiedon,_rlh_project_value&$filter=_rlh_project_value eq '${projectId}'`
  )

  if (filesRes.value.length === 0) {
    return []
  }

  const fileIds = filesRes.value.map((file) => file.rlh_fileid)
  const filter = fileIds.map((id) => `_rlh_file_value eq '${id}'`).join(' or ')

  const linksRes = await dvGet<{ value: DvProjectFileLink[] }>(
    `rlh_filelinks?$select=rlh_filelinkid,rlh_linkedrecordtype,rlh_linkedrecordid,rlh_linkedrecordlabel,_rlh_file_value&$filter=${filter}`
  )

  const linksByFileId = new Map<string, ProjectFileLink[]>()
  for (const rawLink of linksRes.value) {
    const link = toProjectFileLink(rawLink)
    if (!link.fileId) continue
    const existing = linksByFileId.get(link.fileId) ?? []
    existing.push(link)
    linksByFileId.set(link.fileId, existing)
  }

  return filesRes.value.map((file) => toProjectFile(file, linksByFileId.get(file.rlh_fileid) ?? []))
}
