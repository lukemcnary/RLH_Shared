// ============================================================
// Dataverse Queries — Files
// ============================================================
// Dataverse tables:
//   rlh_files
//   rlh_filelinks
// ============================================================

import { dvGet } from '../client'
import type { ProjectFile, ProjectFileLink } from '@/types/database'

interface DvProjectFile {
  rlh_fileid: string
  rlh_filename: string
  rlh_sharepointurl?: string
  rlh_filetype?: string
  rlh_filesize?: number
  rlh_notes?: string
  rlh_librarykey?: ProjectFile['libraryKey']
  rlh_sharepointsiteid?: string
  rlh_sharepointdriveid?: string
  rlh_sharepointitemid?: string
  createdon?: string
  modifiedon?: string
  _rlh_project_value: string
}

interface DvProjectFileLink {
  rlh_filelinkid: string
  rlh_linkedrecordtype?: string
  rlh_linkedrecordid?: string
  rlh_linkedrecordlabel?: string
  _rlh_file_value?: string
}

function toProjectFile(dv: DvProjectFile, linkedRecords: ProjectFileLink[]): ProjectFile {
  return {
    id: dv.rlh_fileid,
    registeredFileId: dv.rlh_fileid,
    projectId: dv._rlh_project_value,
    libraryKey: dv.rlh_librarykey ?? 'admin_files',
    name: dv.rlh_filename,
    notes: dv.rlh_notes,
    sharepointUrl: dv.rlh_sharepointurl,
    sharePointSiteId: dv.rlh_sharepointsiteid,
    sharePointDriveId: dv.rlh_sharepointdriveid,
    sharePointItemId: dv.rlh_sharepointitemid,
    registrationState: 'registered',
    fileSizeBytes: dv.rlh_filesize,
    mimeType: dv.rlh_filetype,
    createdAt: dv.createdon,
    modifiedAt: dv.modifiedon,
    linkedRecords,
  }
}

function toProjectFileLink(dv: DvProjectFileLink): ProjectFileLink {
  return {
    id: dv.rlh_filelinkid,
    fileId: dv._rlh_file_value ?? '',
    linkedRecordType: dv.rlh_linkedrecordtype ?? '',
    linkedRecordId: dv.rlh_linkedrecordid ?? '',
    linkedRecordLabel: dv.rlh_linkedrecordlabel,
  }
}

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
