// ============================================================
// Server Actions — Expectations
// ============================================================
//
// Mutations for the expectations feature.
// Covers org-level library CRUD and project-level junction management.
//
// In MOCK mode the actions are no-ops that just revalidate.
// In LIVE mode they write to Dataverse via dvFetch().
// ============================================================

'use server'

import { revalidatePath } from 'next/cache'
import { dvFetch } from '@/lib/dataverse/client'
import type {
  CreateExpectationPayload,
  UpdateProjectExpectationPayload,
  ExpectationCategory,
} from '@/types/database'

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

// ─── Helpers ─────────────────────────────────────────────────

function projectPath(projectId: string) {
  return `/projects/${projectId}/expectations`
}

const CATEGORY_TO_DV: Record<ExpectationCategory, number> = {
  general:                    936880000,
  communication:              936880001,
  site_conditions:            936880002,
  preparation_coordination:   936880003,
  quality_standards:          936880004,
}

const SOURCE_TO_DV = {
  auto:   936880000,
  manual: 936880001,
} as const


// ─── Org-level library mutations ─────────────────────────────

/**
 * Create a new expectation in the org-level library.
 */
export async function createExpectation(
  payload: CreateExpectationPayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (IS_MOCK) {
    const mock = await import('@/lib/mock-data')
    const id = `exp-${Date.now()}`
    mock.MOCK_EXPECTATIONS.push({
      id,
      description: payload.description,
      category: payload.category,
      tradeTypeId: payload.tradeTypeId,
      tradeType: payload.tradeTypeId ? mock.MOCK_TRADE_TYPES.find((tradeType) => tradeType.id === payload.tradeTypeId) : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    })
    revalidatePath('/expectations')
    return { ok: true, id }
  }

  try {
    const body: Record<string, unknown> = {
      rlh_description: payload.description,
      rlh_category:    CATEGORY_TO_DV[payload.category],
      rlh_isactive:    true,
    }
    if (payload.tradeTypeId) {
      body['rlh_tradetype@odata.bind'] = `/cr6cd_trades(${payload.tradeTypeId})`
    }

    const res = await dvFetch('rlh_expectations', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Prefer: 'return=representation',
        'Content-Type': 'application/json',
      },
    })

    const json = await res.json() as { rlh_expectationid: string }
    return { ok: true, id: json.rlh_expectationid }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[createExpectation]', msg)
    return { ok: false, error: msg }
  }
}

/**
 * Update an existing expectation in the org-level library.
 */
export async function updateExpectation(
  id: string,
  payload: Partial<CreateExpectationPayload> & { isActive?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  if (IS_MOCK) {
    const mock = await import('@/lib/mock-data')
    const index = mock.MOCK_EXPECTATIONS.findIndex((expectation) => expectation.id === id)
    if (index >= 0) {
      const current = mock.MOCK_EXPECTATIONS[index]
      const tradeTypeId = payload.tradeTypeId !== undefined ? payload.tradeTypeId : current.tradeTypeId
      mock.MOCK_EXPECTATIONS[index] = {
        ...current,
        description: payload.description ?? current.description,
        category: payload.category ?? current.category,
        tradeTypeId,
        tradeType: tradeTypeId ? mock.MOCK_TRADE_TYPES.find((tradeType) => tradeType.id === tradeTypeId) : undefined,
        isActive: payload.isActive ?? current.isActive,
        updatedAt: new Date().toISOString(),
      }
    }
    revalidatePath('/expectations')
    return { ok: true }
  }

  try {
    const body: Record<string, unknown> = {}
    if (payload.description !== undefined) body.rlh_description = payload.description
    if (payload.category !== undefined)    body.rlh_category    = CATEGORY_TO_DV[payload.category]
    if (payload.isActive !== undefined)    body.rlh_isactive    = payload.isActive
    if (payload.tradeTypeId !== undefined) {
      body['rlh_tradetype@odata.bind'] = `/cr6cd_trades(${payload.tradeTypeId})`
    }

    if (Object.keys(body).length > 0) {
      await dvFetch(`rlh_expectations(${id})`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    }

    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[updateExpectation]', msg)
    return { ok: false, error: msg }
  }
}


// ─── Project-level junction mutations ────────────────────────

/**
 * Auto-populate project expectations from the active org-level library
 * based on the project's assigned trades.
 *
 * For each active expectation:
 *   - If it has no trade type (general), include it.
 *   - If it has a trade type, include it only if that trade is assigned to the project.
 *
 * Skips expectations that already have a ProjectExpectation row for this project.
 */
export async function populateProjectExpectations(
  projectId: string
): Promise<{ ok: boolean; created: number; error?: string }> {
  if (IS_MOCK) {
    const mock = await import('@/lib/mock-data')
    const tradeTypeIds = new Set(
      mock.MOCK_PROJECT_TRADES
        .filter((projectTrade) => projectTrade.projectId === projectId)
        .map((projectTrade) => projectTrade.tradeTypeId)
    )
    const existingExpectationIds = new Set(
      mock.MOCK_PROJECT_EXPECTATIONS
        .filter((projectExpectation) => projectExpectation.projectId === projectId)
        .map((projectExpectation) => projectExpectation.expectationId)
    )

    let created = 0
    let sortOrder = mock.MOCK_PROJECT_EXPECTATIONS
      .filter((projectExpectation) => projectExpectation.projectId === projectId)
      .reduce((max, projectExpectation) => Math.max(max, projectExpectation.sortOrder ?? 0), 0)

    for (const expectation of mock.MOCK_EXPECTATIONS) {
      if (!expectation.isActive) continue
      if (existingExpectationIds.has(expectation.id)) continue
      if (expectation.tradeTypeId && !tradeTypeIds.has(expectation.tradeTypeId)) continue

      sortOrder += 10
      mock.MOCK_PROJECT_EXPECTATIONS.push({
        id: `pe-${projectId}-${expectation.id}`,
        projectId,
        expectationId: expectation.id,
        expectation,
        isIncluded: true,
        sortOrder,
        source: 'auto',
      })
      existingExpectationIds.add(expectation.id)
      created++
    }

    revalidatePath(projectPath(projectId))
    return { ok: true, created }
  }

  try {
    // 1. Get active expectations
    const expRes = await dvFetch(
      `rlh_expectations?$select=rlh_expectationid,_rlh_tradetype_value&$filter=rlh_isactive eq true`
    )
    const expectations = (await expRes.json()) as {
      value: { rlh_expectationid: string; _rlh_tradetype_value?: string }[]
    }

    // 2. Get project trades
    const ptRes = await dvFetch(
      `rlh_projecttrades?$select=_rlh_tradetype_value&$filter=_rlh_project_value eq '${projectId}'`
    )
    const projectTrades = (await ptRes.json()) as {
      value: { _rlh_tradetype_value: string }[]
    }
    const tradeTypeIds = new Set(projectTrades.value.map(pt => pt._rlh_tradetype_value))

    // 3. Get existing project expectations to avoid duplicates
    const peRes = await dvFetch(
      `rlh_projectexpectations?$select=_rlh_expectation_value&$filter=_rlh_project_value eq '${projectId}'`
    )
    const existing = (await peRes.json()) as {
      value: { _rlh_expectation_value: string }[]
    }
    const existingExpIds = new Set(existing.value.map(pe => pe._rlh_expectation_value))

    // 4. Filter and create
    let created = 0
    let sortOrder = existing.value.length + 1

    for (const exp of expectations.value) {
      // Skip if already linked
      if (existingExpIds.has(exp.rlh_expectationid)) continue

      // Skip trade-specific expectations if that trade isn't on this project
      if (exp._rlh_tradetype_value && !tradeTypeIds.has(exp._rlh_tradetype_value)) continue

      const body: Record<string, unknown> = {
        rlh_isincluded: true,
        rlh_sortorder:  sortOrder,
        rlh_source:     SOURCE_TO_DV.auto,
        'rlh_project@odata.bind':     `/cr6cd_projects(${projectId})`,
        'rlh_expectation@odata.bind':  `/rlh_expectations(${exp.rlh_expectationid})`,
      }

      await dvFetch('rlh_projectexpectations', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      created++
      sortOrder++
    }

    revalidatePath(projectPath(projectId))
    return { ok: true, created }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[populateProjectExpectations]', msg)
    return { ok: false, created: 0, error: msg }
  }
}

/**
 * Update a project expectation (toggle inclusion, set custom text, reorder).
 */
export async function updateProjectExpectation(
  payload: UpdateProjectExpectationPayload,
  projectId: string
): Promise<{ ok: boolean; error?: string }> {
  if (IS_MOCK) {
    const mock = await import('@/lib/mock-data')
    const index = mock.MOCK_PROJECT_EXPECTATIONS.findIndex((projectExpectation) => projectExpectation.id === payload.id)
    if (index >= 0) {
      const current = mock.MOCK_PROJECT_EXPECTATIONS[index]
      mock.MOCK_PROJECT_EXPECTATIONS[index] = {
        ...current,
        isIncluded: payload.isIncluded ?? current.isIncluded,
        customText: payload.customText !== undefined ? payload.customText : current.customText,
        sortOrder: payload.sortOrder ?? current.sortOrder,
      }
    }
    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    const body: Record<string, unknown> = {}
    if (payload.isIncluded !== undefined)  body.rlh_isincluded = payload.isIncluded
    if (payload.customText !== undefined)  body.rlh_customtext = payload.customText
    if (payload.sortOrder !== undefined)   body.rlh_sortorder  = payload.sortOrder

    if (Object.keys(body).length > 0) {
      await dvFetch(`rlh_projectexpectations(${payload.id})`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    }

    revalidatePath(projectPath(projectId))
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[updateProjectExpectation]', msg)
    return { ok: false, error: msg }
  }
}

/**
 * Create a new expectation and link it to the project.
 */
export async function createExpectationForProject(
  projectId: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const description = formData.get('description') as string
  const category = (formData.get('category') as ExpectationCategory) || 'general'
  const tradeTypeId = (formData.get('tradeTypeId') as string) || undefined

  if (IS_MOCK) {
    const { createProjectExpectation } = await import('@/lib/dataverse/adapter')
    await createProjectExpectation(projectId, { description, category, tradeTypeId })
    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  // Live mode: create in org library, then link to project
  const result = await createExpectation({ description, category, tradeTypeId })
  if (!result.ok || !result.id) return { ok: false, error: result.error }

  const body: Record<string, unknown> = {
    rlh_isincluded: true,
    rlh_sortorder: 1,
    rlh_source: SOURCE_TO_DV.manual,
    'rlh_project@odata.bind': `/cr6cd_projects(${projectId})`,
    'rlh_expectation@odata.bind': `/rlh_expectations(${result.id})`,
  }
  try {
    await dvFetch('rlh_projectexpectations', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    revalidatePath(projectPath(projectId))
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}

/**
 * Remove a project expectation row entirely.
 */
export async function removeProjectExpectation(
  id: string,
  projectId: string
): Promise<{ ok: boolean; error?: string }> {
  if (IS_MOCK) {
    revalidatePath(projectPath(projectId))
    return { ok: true }
  }

  try {
    await dvFetch(`rlh_projectexpectations(${id})`, { method: 'DELETE' })
    revalidatePath(projectPath(projectId))
    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[removeProjectExpectation]', msg)
    return { ok: false, error: msg }
  }
}
