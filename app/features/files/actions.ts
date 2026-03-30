'use server'

import { revalidatePath } from 'next/cache'
import { dvFetch, dvGet } from '@/lib/dataverse/client'
import { getProject } from '@/lib/dataverse/adapter'
import { getLibraryDefinition, type SharePointMetadataField } from '@/lib/sharepoint/config'
import {
  getDriveItem,
  listSiteDrives,
  patchDriveItemFields,
  resolveSiteIdFromUrl,
  uploadDriveFile,
} from '@/lib/sharepoint/client'
import type { ProjectFileLibraryKey } from '@/types/database'

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

function filesPath(projectId: string) {
  return `/projects/${projectId}/files`
}

function projectHomePath(projectId: string) {
  return `/projects/${projectId}`
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getMetadataValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('metadata_') || typeof value !== 'string') continue
    values[key.slice('metadata_'.length)] = value.trim()
  }
  return values
}

function validateRequiredMetadata(
  metadataFields: SharePointMetadataField[],
  metadataValues: Record<string, string>,
) {
  for (const field of metadataFields) {
    if (field.required && !metadataValues[field.key]) {
      throw new Error(`${field.label} is required for this library.`)
    }
  }
}

function summarizeMetadata(metadataFields: SharePointMetadataField[], metadataValues: Record<string, string>) {
  const summary = metadataFields
    .map((field) => {
      const value = metadataValues[field.key]
      return value ? `${field.label}: ${value}` : null
    })
    .filter(Boolean)
    .join(' | ')

  return summary || null
}

function buildMappedFields(
  metadataFields: SharePointMetadataField[],
  metadataValues: Record<string, string>,
) {
  const mappedFields: Record<string, string | boolean> = {}

  for (const field of metadataFields) {
    if (!field.sharePointFieldName) continue
    const rawValue = metadataValues[field.key]
    if (!rawValue) continue
    mappedFields[field.sharePointFieldName] = field.type === 'boolean'
      ? rawValue === 'true'
      : rawValue
  }

  return mappedFields
}

async function resolveProjectSite(projectId: string) {
  const project = await getProject(projectId)
  if (!project) {
    throw new Error('Project not found.')
  }

  const siteUrl = project.sharePointSiteUrl
  const siteId = project.sharePointSiteId ?? (
    siteUrl ? await resolveSiteIdFromUrl(siteUrl) : ''
  )

  if (!siteUrl || !siteId) {
    throw new Error('Project SharePoint site is not connected yet.')
  }

  return { project, siteUrl, siteId }
}

async function resolveLibraryDrive(siteId: string, libraryKey: ProjectFileLibraryKey) {
  const definition = getLibraryDefinition(libraryKey)
  const drives = await listSiteDrives(siteId)
  const drive = drives.find((candidate) => candidate.name === definition.displayName)

  if (!drive) {
    throw new Error(`SharePoint library not found: ${definition.displayName}`)
  }

  return { definition, drive }
}

async function findExistingFileReference(
  projectId: string,
  driveId: string,
  itemId: string,
) {
  const result = await dvGet<{ value: { rlh_fileid: string }[] }>(
    `rlh_files?$select=rlh_fileid&$filter=_rlh_project_value eq '${projectId}' and rlh_sharepointdriveid eq '${driveId}' and rlh_sharepointitemid eq '${itemId}'`
  )

  return result.value[0]?.rlh_fileid
}

async function createFileReference(params: {
  projectId: string
  projectName: string
  libraryKey: ProjectFileLibraryKey
  siteId: string
  driveId: string
  itemId: string
  fileName: string
  sharepointUrl?: string
  mimeType?: string
  fileSizeBytes?: number
  notes?: string
}) {
  const existingId = await findExistingFileReference(params.projectId, params.driveId, params.itemId)
  if (existingId) {
    return existingId
  }

  const body: Record<string, unknown> = {
    rlh_filename: params.fileName,
    rlh_sharepointurl: params.sharepointUrl,
    rlh_filetype: params.mimeType,
    rlh_filesize: params.fileSizeBytes,
    rlh_notes: params.notes,
    rlh_librarykey: params.libraryKey,
    rlh_sharepointsiteid: params.siteId,
    rlh_sharepointdriveid: params.driveId,
    rlh_sharepointitemid: params.itemId,
    'rlh_project@odata.bind': `/cr6cd_projects(${params.projectId})`,
  }

  const res = await dvFetch('rlh_files', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json() as { rlh_fileid: string }
  return json.rlh_fileid
}

export async function connectProjectSharePointSite(formData: FormData) {
  const projectId = readString(formData, 'projectId')
  const sharePointSiteUrl = readString(formData, 'sharePointSiteUrl')

  if (!projectId || !sharePointSiteUrl) {
    throw new Error('Project and SharePoint site URL are required.')
  }

  if (IS_MOCK) {
    revalidatePath(projectHomePath(projectId))
    revalidatePath(filesPath(projectId))
    return
  }

  const siteId = await resolveSiteIdFromUrl(sharePointSiteUrl)

  await dvFetch(`cr6cd_projects(${projectId})`, {
    method: 'PATCH',
    body: JSON.stringify({
      rlh_sharepointsiteurl: sharePointSiteUrl,
      rlh_sharepointsiteid: siteId,
    }),
  })

  revalidatePath(projectHomePath(projectId))
  revalidatePath(filesPath(projectId))
}

export async function uploadProjectFile(formData: FormData) {
  const projectId = readString(formData, 'projectId')
  const libraryKey = readString(formData, 'libraryKey') as ProjectFileLibraryKey
  const notes = readString(formData, 'notes')
  const linkedRecordType = readString(formData, 'linkedRecordType')
  const linkedRecordId = readString(formData, 'linkedRecordId')
  const linkedRecordLabel = readString(formData, 'linkedRecordLabel')
  const file = formData.get('file')

  if (!projectId || !libraryKey || !(file instanceof File) || file.size === 0) {
    throw new Error('Project, library, and file are required.')
  }

  if (IS_MOCK) {
    revalidatePath(filesPath(projectId))
    return
  }

  const metadataValues = getMetadataValues(formData)
  const { project, siteId } = await resolveProjectSite(projectId)
  const { definition, drive } = await resolveLibraryDrive(siteId, libraryKey)

  validateRequiredMetadata(definition.metadataFields, metadataValues)

  const uploaded = await uploadDriveFile(
    drive.id,
    file.name,
    await file.arrayBuffer(),
    file.type || 'application/octet-stream',
  )

  const mappedFields = buildMappedFields(definition.metadataFields, metadataValues)
  if (Object.keys(mappedFields).length > 0) {
    await patchDriveItemFields(drive.id, uploaded.id, mappedFields)
  }

  const metadataSummary = summarizeMetadata(definition.metadataFields, metadataValues)
  const combinedNotes = [notes, metadataSummary ? `Upload metadata: ${metadataSummary}` : null]
    .filter(Boolean)
    .join('\n\n')

  const fileId = await createFileReference({
    projectId,
    projectName: project.name,
    libraryKey,
    siteId,
    driveId: drive.id,
    itemId: uploaded.id,
    fileName: uploaded.name,
    sharepointUrl: uploaded.webUrl,
    mimeType: uploaded.file?.mimeType ?? file.type,
    fileSizeBytes: uploaded.size ?? file.size,
    notes: combinedNotes || undefined,
  })

  if (linkedRecordType && linkedRecordId) {
    await dvFetch('rlh_filelinks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rlh_linkedrecordtype: linkedRecordType,
        rlh_linkedrecordid: linkedRecordId,
        rlh_linkedrecordlabel: linkedRecordLabel || undefined,
        'rlh_file@odata.bind': `/rlh_files(${fileId})`,
      }),
    })
  }

  revalidatePath(projectHomePath(projectId))
  revalidatePath(filesPath(projectId))
}

export async function registerExistingSharePointFile(formData: FormData) {
  const projectId = readString(formData, 'projectId')
  const libraryKey = readString(formData, 'libraryKey') as ProjectFileLibraryKey
  const driveId = readString(formData, 'driveId')
  const itemId = readString(formData, 'itemId')

  if (!projectId || !libraryKey || !driveId || !itemId) {
    throw new Error('Project, library, drive, and file item are required.')
  }

  if (IS_MOCK) {
    revalidatePath(filesPath(projectId))
    return
  }

  const { project, siteId } = await resolveProjectSite(projectId)
  const item = await getDriveItem(driveId, itemId)

  await createFileReference({
    projectId,
    projectName: project.name,
    libraryKey,
    siteId,
    driveId,
    itemId,
    fileName: item.name,
    sharepointUrl: item.webUrl,
    mimeType: item.file?.mimeType,
    fileSizeBytes: item.size,
  })

  revalidatePath(filesPath(projectId))
}

export async function attachFileToRecord(formData: FormData) {
  const projectId = readString(formData, 'projectId')
  const fileId = readString(formData, 'fileId')
  const linkedRecordType = readString(formData, 'linkedRecordType')
  const linkedRecordId = readString(formData, 'linkedRecordId')
  const linkedRecordLabel = readString(formData, 'linkedRecordLabel')

  if (!projectId || !fileId || !linkedRecordType || !linkedRecordId) {
    throw new Error('Project, file, record type, and record id are required.')
  }

  if (IS_MOCK) {
    revalidatePath(filesPath(projectId))
    return
  }

  await dvFetch('rlh_filelinks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rlh_linkedrecordtype: linkedRecordType,
      rlh_linkedrecordid: linkedRecordId,
      rlh_linkedrecordlabel: linkedRecordLabel || undefined,
      'rlh_file@odata.bind': `/rlh_files(${fileId})`,
    }),
  })

  revalidatePath(filesPath(projectId))
}

export async function detachFileFromRecord(formData: FormData) {
  const projectId = readString(formData, 'projectId')
  const linkId = readString(formData, 'linkId')

  if (!projectId || !linkId) {
    throw new Error('Project and file link are required.')
  }

  if (IS_MOCK) {
    revalidatePath(filesPath(projectId))
    return
  }

  await dvFetch(`rlh_filelinks(${linkId})`, { method: 'DELETE' })
  revalidatePath(filesPath(projectId))
}
