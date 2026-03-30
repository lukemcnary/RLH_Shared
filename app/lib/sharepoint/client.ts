const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID ?? ''
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID ?? ''
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET ?? ''
const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0'

interface GraphToken {
  value: string
  expiresAt: number
}

export interface GraphDrive {
  id: string
  name: string
  webUrl?: string
}

export interface GraphDriveItem {
  id: string
  name: string
  webUrl?: string
  size?: number
  createdDateTime?: string
  lastModifiedDateTime?: string
  file?: {
    mimeType?: string
  }
  folder?: {
    childCount?: number
  }
  parentReference?: {
    path?: string
  }
}

let cachedGraphToken: GraphToken | null = null

async function getGraphToken(): Promise<string> {
  const now = Date.now()

  if (cachedGraphToken && cachedGraphToken.expiresAt > now + 60_000) {
    return cachedGraphToken.value
  }

  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    throw new Error(
      'Microsoft Graph credentials not configured. ' +
      'Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET in .env.local'
    )
  }

  const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AZURE_CLIENT_ID,
    client_secret: AZURE_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
  })

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Microsoft Graph token request failed (${res.status}): ${text}`)
  }

  const json: { access_token: string; expires_in: number } = await res.json()

  cachedGraphToken = {
    value: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  }

  return cachedGraphToken.value
}

export async function graphFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getGraphToken()
  const res = await fetch(`${GRAPH_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Graph ${options?.method ?? 'GET'} ${path} failed (${res.status}): ${text}`)
  }

  return res
}

export async function graphGet<T>(path: string): Promise<T> {
  const res = await graphFetch(path)
  return res.json() as Promise<T>
}

export async function resolveSiteIdFromUrl(siteUrl: string): Promise<string> {
  const parsed = new URL(siteUrl)
  const path = parsed.pathname.replace(/\/$/, '')
  if (!path) {
    throw new Error(`Invalid SharePoint site URL: ${siteUrl}`)
  }

  const site = await graphGet<{ id: string }>(`/sites/${parsed.hostname}:${path}`)
  return site.id
}

export async function listSiteDrives(siteId: string): Promise<GraphDrive[]> {
  const res = await graphGet<{ value: GraphDrive[] }>(`/sites/${siteId}/drives?$select=id,name,webUrl`)
  return res.value
}

async function listDriveChildren(
  driveId: string,
  itemId?: string,
): Promise<GraphDriveItem[]> {
  const path = itemId
    ? `/drives/${driveId}/items/${itemId}/children?$select=id,name,webUrl,size,createdDateTime,lastModifiedDateTime,parentReference,file,folder`
    : `/drives/${driveId}/root/children?$select=id,name,webUrl,size,createdDateTime,lastModifiedDateTime,parentReference,file,folder`

  const res = await graphGet<{ value: GraphDriveItem[] }>(path)
  return res.value
}

export async function listDriveFilesRecursively(driveId: string): Promise<GraphDriveItem[]> {
  async function walk(itemId?: string): Promise<GraphDriveItem[]> {
    const children = await listDriveChildren(driveId, itemId)
    const files: GraphDriveItem[] = []

    for (const child of children) {
      if (child.folder) {
        files.push(...await walk(child.id))
      } else {
        files.push(child)
      }
    }

    return files
  }

  return walk()
}

export async function getDriveItem(driveId: string, itemId: string): Promise<GraphDriveItem> {
  return graphGet<GraphDriveItem>(
    `/drives/${driveId}/items/${itemId}?$select=id,name,webUrl,size,createdDateTime,lastModifiedDateTime,parentReference,file,folder`
  )
}

export async function uploadDriveFile(
  driveId: string,
  fileName: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<GraphDriveItem> {
  const safeFileName = fileName.replace(/\//g, '-')
  const res = await graphFetch(`/drives/${driveId}/root:/${encodeURIComponent(safeFileName)}:/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType || 'application/octet-stream',
    },
    body,
  })

  return res.json() as Promise<GraphDriveItem>
}

export async function patchDriveItemFields(
  driveId: string,
  itemId: string,
  fields: Record<string, string | boolean>,
): Promise<void> {
  if (Object.keys(fields).length === 0) {
    return
  }

  await graphFetch(`/drives/${driveId}/items/${itemId}/listItem/fields`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  })
}
