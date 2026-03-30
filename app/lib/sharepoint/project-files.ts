import type { Project, ProjectFile } from '@/types/database'
import { getProject, getProjectFileReferences } from '@/lib/dataverse/adapter'
import { CANONICAL_PROJECT_LIBRARIES, type SharePointLibraryDefinition } from './config'
import {
  type GraphDrive,
  listDriveFilesRecursively,
  listSiteDrives,
  resolveSiteIdFromUrl,
} from './client'

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

export interface ProjectFileLibraryView extends SharePointLibraryDefinition {
  files: ProjectFile[]
}

export interface ProjectFilesHubData {
  project: Project
  hasSiteBinding: boolean
  libraries: ProjectFileLibraryView[]
  totalFiles: number
  registeredCount: number
  sharePointOnlyCount: number
  loadError?: string
}

function sharePointKey(driveId?: string, itemId?: string) {
  return driveId && itemId ? `${driveId}:${itemId}` : null
}

function toSharePointOnlyFile(
  projectId: string,
  libraryKey: ProjectFile['libraryKey'],
  siteId: string,
  drive: GraphDrive,
  item: {
    id: string
    name: string
    webUrl?: string
    size?: number
    createdDateTime?: string
    lastModifiedDateTime?: string
    file?: { mimeType?: string }
  },
): ProjectFile {
  return {
    id: `sp:${drive.id}:${item.id}`,
    projectId,
    libraryKey,
    name: item.name,
    sharepointUrl: item.webUrl,
    sharePointSiteId: siteId,
    sharePointDriveId: drive.id,
    sharePointItemId: item.id,
    registrationState: 'sharepoint_only',
    fileSizeBytes: item.size,
    mimeType: item.file?.mimeType,
    createdAt: item.createdDateTime,
    modifiedAt: item.lastModifiedDateTime,
    linkedRecords: [],
  }
}

async function listLiveSharePointFiles(project: Project): Promise<ProjectFile[]> {
  const siteId = project.sharePointSiteId ?? (
    project.sharePointSiteUrl
      ? await resolveSiteIdFromUrl(project.sharePointSiteUrl)
      : null
  )

  if (!siteId) {
    return []
  }

  const drives = await listSiteDrives(siteId)
  const files: ProjectFile[] = []

  for (const library of CANONICAL_PROJECT_LIBRARIES) {
    const drive = drives.find((candidate) => candidate.name === library.displayName)
    if (!drive) continue

    const items = await listDriveFilesRecursively(drive.id)
    for (const item of items) {
      files.push(toSharePointOnlyFile(project.id, library.key, siteId, drive, item))
    }
  }

  return files
}

async function listSharePointFiles(project: Project): Promise<ProjectFile[]> {
  if (IS_MOCK) {
    const mock = await import('@/lib/mock-data')
    return mock.MOCK_PROJECT_FILES.filter((file) => file.projectId === project.id)
  }

  return listLiveSharePointFiles(project)
}

function mergeFiles(
  sharePointFiles: ProjectFile[],
  registeredFiles: ProjectFile[],
): ProjectFile[] {
  const refsByKey = new Map<string, ProjectFile>()
  for (const file of registeredFiles) {
    const key = sharePointKey(file.sharePointDriveId, file.sharePointItemId)
    if (key) refsByKey.set(key, file)
  }

  const seenKeys = new Set<string>()
  const merged: ProjectFile[] = sharePointFiles.map((file): ProjectFile => {
    const key = sharePointKey(file.sharePointDriveId, file.sharePointItemId)
    if (!key) return file
    seenKeys.add(key)

    const registered = refsByKey.get(key)
    if (!registered) return file

    return {
      ...file,
      ...registered,
      id: registered.id,
      registeredFileId: registered.registeredFileId ?? registered.id,
      registrationState: 'registered',
      linkedRecords: registered.linkedRecords ?? [],
    }
  })

  const orphans = registeredFiles.filter((file) => {
    const key = sharePointKey(file.sharePointDriveId, file.sharePointItemId)
    return key ? !seenKeys.has(key) : true
  })

  return [...merged, ...orphans]
}

function sortFiles(files: ProjectFile[]) {
  return [...files].sort((a, b) => {
    const dateA = a.modifiedAt ?? a.createdAt ?? ''
    const dateB = b.modifiedAt ?? b.createdAt ?? ''
    return dateB.localeCompare(dateA) || a.name.localeCompare(b.name)
  })
}

export async function getProjectFilesHubData(projectId: string): Promise<ProjectFilesHubData | null> {
  const project = await getProject(projectId)
  if (!project) return null

  const emptyLibraries = CANONICAL_PROJECT_LIBRARIES.map((library) => ({
    ...library,
    files: [] as ProjectFile[],
  }))

  const hasSiteBinding = Boolean(project.sharePointSiteUrl || project.sharePointSiteId)
  if (!hasSiteBinding) {
    return {
      project,
      hasSiteBinding,
      libraries: emptyLibraries,
      totalFiles: 0,
      registeredCount: 0,
      sharePointOnlyCount: 0,
    }
  }

  try {
    const [sharePointFiles, registeredFiles] = await Promise.all([
      listSharePointFiles(project),
      getProjectFileReferences(projectId),
    ])

    const merged = mergeFiles(sharePointFiles, registeredFiles)
    const libraries = CANONICAL_PROJECT_LIBRARIES.map((library) => ({
      ...library,
      files: sortFiles(merged.filter((file) => file.libraryKey === library.key)),
    }))

    return {
      project,
      hasSiteBinding,
      libraries,
      totalFiles: merged.length,
      registeredCount: merged.filter((file) => file.registrationState === 'registered').length,
      sharePointOnlyCount: merged.filter((file) => file.registrationState === 'sharepoint_only').length,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      project,
      hasSiteBinding,
      libraries: emptyLibraries,
      totalFiles: 0,
      registeredCount: 0,
      sharePointOnlyCount: 0,
      loadError: message,
    }
  }
}
