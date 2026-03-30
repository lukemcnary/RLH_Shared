// ============================================================
// Dataverse HTTP Client
// ============================================================
//
// Low-level authenticated fetch wrapper for the Dataverse OData API.
// This file knows about Azure tokens and HTTP — nothing else.
//
// Credentials needed for live Dataverse mode:
//   DATAVERSE_URL=https://yourorg.crm.dynamics.com
//   AZURE_TENANT_ID=...
//   AZURE_CLIENT_ID=...
//   AZURE_CLIENT_SECRET=...   (or use MSAL device flow for dev)
//   DATAVERSE_MODE=live
// ============================================================

const DATAVERSE_URL = process.env.DATAVERSE_URL ?? ''
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID ?? ''
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID ?? ''
const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET ?? ''

// ─── Token cache ─────────────────────────────────────────────
// Simple in-memory cache so we don't hit Azure on every request.
// Next.js server restarts clear this — that's intentional.

let _cachedToken: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  const now = Date.now()

  // Reuse token if it has more than 60 seconds of life left
  if (_cachedToken && _cachedToken.expiresAt > now + 60_000) {
    return _cachedToken.value
  }

  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    throw new Error(
      'Dataverse credentials not configured. ' +
      'Set AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET in .env.local'
    )
  }

  // Client credentials flow (server-to-server — no user interaction required)
  const tokenUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`
  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     AZURE_CLIENT_ID,
    client_secret: AZURE_CLIENT_SECRET,
    scope:         `${DATAVERSE_URL}/.default`,
  })

  const res = await fetch(tokenUrl, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Azure token request failed (${res.status}): ${text}`)
  }

  const json: { access_token: string; expires_in: number } = await res.json()

  _cachedToken = {
    value:     json.access_token,
    expiresAt: now + json.expires_in * 1000,
  }

  return _cachedToken.value
}

// ─── Public fetch wrapper ─────────────────────────────────────

/**
 * dvFetch — authenticated OData request to Dataverse.
 *
 * @param path   OData path relative to /api/data/v9.2/ — e.g.
 *               "cr6cd_projects?$filter=..."
 * @param options Standard RequestInit (method, body, headers, …)
 */
export async function dvFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getToken()
  const url = `${DATAVERSE_URL}/api/data/v9.2/${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization:       `Bearer ${token}`,
      Accept:              'application/json',
      'Content-Type':      'application/json',
      'OData-MaxVersion':  '4.0',
      'OData-Version':     '4.0',
      Prefer:              'odata.include-annotations="*"',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Dataverse ${options?.method ?? 'GET'} /${path} failed (${res.status}): ${text}`)
  }

  return res
}

/**
 * dvGet — convenience wrapper that parses JSON automatically.
 * Use for single-record and collection fetches.
 */
export async function dvGet<T>(path: string): Promise<T> {
  const res = await dvFetch(path)
  return res.json() as Promise<T>
}
