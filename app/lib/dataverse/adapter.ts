// ============================================================
// Dataverse Adapter — Public API
// ============================================================
//
// This is the ONLY file the rest of the app imports from for
// data reads. It switches between mock and live Dataverse
// based on DATAVERSE_MODE env var. No UI code ever checks
// this flag — the switch is invisible above this layer.
//
// Usage in server components:
//   import { getProject, getCostItems } from '@/lib/dataverse/adapter'
//
// Mutations (server actions) are imported directly from
//   features/[feature]/actions.ts
// ============================================================

import type {
  Project, Gate, ProjectTrade, Mobilization, TradeType, CostCode,
  CostItem, ScopeItem, ScopeDetail, Selection, BidPackage, Task,
  ProjectExecutionData, SequencerData, Expectation, ExpectationCategory, ProjectExpectation, ProjectFile,
  Company, CompanyType, Contact, ContactRole, ProjectContact,
  Client, ClientStatus, ChangeOrder, Rfi, Quote, Capability, CompanyCapability, TradeScope,
} from '@/types/database'

const IS_MOCK = (process.env.DATAVERSE_MODE ?? 'mock') === 'mock'

// ── Lazy-load the right implementation ───────────────────────

async function live() {
  return {
    projects: await import('./queries/projects'),
    gates: await import('./queries/gates'),
    tradeTypes: await import('./queries/trade-types'),
    projectTrades: await import('./queries/project-trades'),
    mobilizations: await import('./queries/mobilizations'),
    tradeScopes: await import('./queries/trade-scopes'),
    costItems: await import('./queries/cost-items'),
    scopeItems: await import('./queries/scope-items'),
    scopeDetails: await import('./queries/scope-details'),
    selections: await import('./queries/selections'),
    bidPackages: await import('./queries/bid-packages'),
    costCodes: await import('./queries/cost-codes'),
    tasks: await import('./queries/tasks'),
    expectations: await import('./queries/expectations'),
    files: await import('./queries/files'),
  }
}

async function mock() {
  return await import('../mock-data')
}

// ── Leads / Clients ─────────────────────────────────────────

export async function getLeads(): Promise<Client[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_CLIENTS.filter(c => c.status !== 'converted')
  }
  return []
}

export async function createLead(data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  if (IS_MOCK) {
    const m = await mock()
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    m.MOCK_CLIENTS.push(newClient)
    return newClient
  }
  throw new Error('Not implemented for Dataverse')
}

export async function updateLeadStatus(clientId: string, status: ClientStatus): Promise<void> {
  if (IS_MOCK) {
    const m = await mock()
    const idx = m.MOCK_CLIENTS.findIndex(c => c.id === clientId)
    if (idx >= 0) m.MOCK_CLIENTS[idx] = { ...m.MOCK_CLIENTS[idx], status }
    return
  }
}

export async function updateLead(clientId: string, data: Partial<Client>): Promise<void> {
  if (IS_MOCK) {
    const m = await mock()
    const idx = m.MOCK_CLIENTS.findIndex(c => c.id === clientId)
    if (idx >= 0) m.MOCK_CLIENTS[idx] = { ...m.MOCK_CLIENTS[idx], ...data }
    return
  }
}

export async function deleteLead(clientId: string): Promise<void> {
  if (IS_MOCK) {
    const m = await mock()
    const idx = m.MOCK_CLIENTS.findIndex(c => c.id === clientId)
    if (idx >= 0) m.MOCK_CLIENTS.splice(idx, 1)
    return
  }
}

const DEFAULT_GATES = [
  { name: 'Gate 1', order: 1, description: 'Site work, excavation, foundation, and underground systems. Slab poured and cured.' },
  { name: 'Gate 2', order: 2, description: 'Structure complete. Framing, roof sheathing, structural inspections passed.' },
  { name: 'Gate 3', order: 3, description: 'Enclosure and systems. Building weather-tight. Rough MEP complete and inspected.' },
  { name: 'Gate 4', order: 4, description: 'Finishes. Drywall complete. All finish trades sequenced and underway.' },
  { name: 'Gate 5', order: 5, description: 'Closeout. All work complete. Final inspections passed. Certificate of occupancy.' },
]

export async function createDefaultGates(projectId: string): Promise<void> {
  if (IS_MOCK) {
    const m = await mock()
    const gates: Gate[] = DEFAULT_GATES.map(g => ({
      id: `gate-${projectId}-${g.order}`,
      projectId,
      name: g.name,
      order: g.order,
      description: g.description,
      lockStatus: 'unlocked' as const,
    }))
    m.MOCK_GATES.push(...gates)
  }
}

export async function createProjectFromLead(clientId: string, projectData: { name: string; address?: string; startDate?: string; completionDate?: string }): Promise<string> {
  if (IS_MOCK) {
    const m = await mock()
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectData.name,
      address: projectData.address,
      startDate: projectData.startDate,
      completionDate: projectData.completionDate,
      status: 'planning',
      clientId,
    }
    m.MOCK_PROJECTS.push(newProject)
    // Create default gates
    await createDefaultGates(newProject.id)
    // Mark client as converted
    const idx = m.MOCK_CLIENTS.findIndex(c => c.id === clientId)
    if (idx >= 0) m.MOCK_CLIENTS[idx] = { ...m.MOCK_CLIENTS[idx], status: 'converted' }
    return newProject.id
  }
  throw new Error('Not implemented for Dataverse')
}

// ── Projects ─────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_PROJECTS
  }
  const q = await live()
  return q.projects.getProjects()
}

export async function getProject(projectId: string): Promise<Project | null> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_PROJECTS.find(p => p.id === projectId) ?? null
  }
  const q = await live()
  return q.projects.getProject(projectId)
}

// ── Gates ─────────────────────────────────────────────────────

export async function getGates(projectId: string): Promise<Gate[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_GATES.filter(g => g.projectId === projectId)
  }
  const q = await live()
  return q.gates.getGates(projectId)
}

// ── Trade Types ───────────────────────────────────────────────

export async function getTradeTypes(): Promise<TradeType[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_TRADE_TYPES
  }
  const q = await live()
  return q.tradeTypes.getTradeTypes()
}

// ── Project Trades ────────────────────────────────────────────

export async function getProjectTrades(projectId: string): Promise<ProjectTrade[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_PROJECT_TRADES.filter(pt => pt.projectId === projectId)
  }
  const q = await live()
  return q.projectTrades.getProjectTrades(projectId)
}

// ── Mobilizations ─────────────────────────────────────────────

export async function getMobilizations(projectId: string): Promise<Mobilization[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_MOBILIZATIONS.filter(mob => mob.projectId === projectId)
  }
  const q = await live()
  const projectTrades = await q.projectTrades.getProjectTrades(projectId)
  return q.mobilizations.getMobilizations(
    projectId,
    new Map(projectTrades.map((projectTrade) => [projectTrade.id, projectTrade])),
  )
}

function toExecutionMobilizations(mobilizations: Mobilization[]): Mobilization[] {
  return mobilizations.map((mobilization) => ({
    ...mobilization,
    // Sequencing logic derives runtime steps from tradeScopes.
    // Keep compatibility step blobs off the execution bundle so
    // the projector has a single authoritative source for steps.
    steps: [],
  }))
}

// ── Sequencer bundle ──────────────────────────────────────────

export async function getSequencerData(projectId: string): Promise<SequencerData | null> {
  if (IS_MOCK) {
    const m = await mock()
    const project = m.MOCK_PROJECTS.find(p => p.id === projectId)
    if (!project) return null
    return {
      project,
      gates: m.MOCK_GATES.filter(g => g.projectId === projectId),
      projectTrades: m.MOCK_PROJECT_TRADES.filter(pt => pt.projectId === projectId),
      mobilizations: m.MOCK_MOBILIZATIONS.filter(mob => mob.projectId === projectId),
    }
  }
  const q = await live()
  const [project, gates, projectTrades] = await Promise.all([
    q.projects.getProject(projectId),
    q.gates.getGates(projectId),
    q.projectTrades.getProjectTrades(projectId),
  ])
  if (!project) return null
  const mobilizations = await q.mobilizations.getMobilizations(
    projectId,
    new Map(projectTrades.map((projectTrade) => [projectTrade.id, projectTrade])),
  )
  return { project, gates, projectTrades, mobilizations }
}

export async function getSequencerPageData(projectId: string): Promise<{
  data: SequencerData
  executionData: ProjectExecutionData
} | null> {
  const data = await getSequencerData(projectId)
  if (!data) return null

  if (IS_MOCK) {
    return {
      data,
      executionData: {
        ...data,
        mobilizations: toExecutionMobilizations(data.mobilizations),
        tradeScopes: [],
      },
    }
  }

  const q = await live()
  const tradeScopes = await q.tradeScopes.getTradeScopes(
    data.projectTrades.map((projectTrade) => projectTrade.id),
    new Map(data.mobilizations.map((mobilization) => [mobilization.id, mobilization])),
  )

  return {
    data,
    executionData: {
      ...data,
      mobilizations: toExecutionMobilizations(data.mobilizations),
      tradeScopes,
    },
  }
}

// ── Sequencer engine input ───────────────────────────────────

export async function getTradeScopes(projectId: string): Promise<TradeScope[]> {
  if (IS_MOCK) {
    return []
  }

  const q = await live()
  const projectTrades = await q.projectTrades.getProjectTrades(projectId)
  const mobilizations = await q.mobilizations.getMobilizations(
    projectId,
    new Map(projectTrades.map((projectTrade) => [projectTrade.id, projectTrade])),
  )

  return q.tradeScopes.getTradeScopes(
    projectTrades.map((projectTrade) => projectTrade.id),
    new Map(mobilizations.map((mobilization) => [mobilization.id, mobilization])),
  )
}

export async function getProjectExecutionData(projectId: string): Promise<ProjectExecutionData | null> {
  const pageData = await getSequencerPageData(projectId)
  return pageData?.executionData ?? null
}

// ── Cost Items ────────────────────────────────────────────────
// Table rlh_costitem does not exist in Dataverse yet.

export async function getCostItems(projectId: string): Promise<CostItem[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_COST_ITEMS.filter(ci => ci.projectId === projectId)
  }
  return [] // rlh_costitem table not yet provisioned
}

// ── Cost Codes ────────────────────────────────────────────────
// Table rlh_costcode does not exist in Dataverse yet.

export async function getCostCodes(): Promise<CostCode[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_COST_CODES
  }
  return [] // rlh_costcode table not yet provisioned
}

// ── Project Scope ─────────────────────────────────────────────
// Table rlh_scopeitem does not exist in Dataverse yet.

export async function getScopeItems(projectId: string): Promise<ScopeItem[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_SCOPE_ITEMS.filter(si => si.projectId === projectId)
  }
  return [] // rlh_scopeitem table not yet provisioned
}

export async function createScopeItem(data: { projectId: string; name: string; description?: string; tradeTypeId?: string; status?: string }): Promise<ScopeItem> {
  if (IS_MOCK) {
    const m = await mock()
    const newItem: ScopeItem = {
      id: `si-${Date.now()}`,
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      tradeTypeId: data.tradeTypeId,
      tradeType: data.tradeTypeId ? m.MOCK_TRADE_TYPES.find(t => t.id === data.tradeTypeId) : undefined,
      status: (data.status as 'draft' | 'confirmed') ?? 'draft',
      createdAt: new Date().toISOString(),
    }
    m.MOCK_SCOPE_ITEMS.push(newItem)
    return newItem
  }
  throw new Error('Not implemented for Dataverse')
}

// ── Scope Details ─────────────────────────────────────────────

// Table rlh_scopedetail does not exist in Dataverse yet.
export async function getScopeDetails(projectId: string): Promise<ScopeDetail[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_SCOPE_DETAILS.filter(sd => sd.projectId === projectId)
  }
  return [] // rlh_scopedetail table not yet provisioned
}

// ── Selections ────────────────────────────────────────────────
// Table rlh_selection does not exist in Dataverse yet.

export async function getSelections(projectId: string): Promise<Selection[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_SELECTIONS.filter(sel => sel.projectId === projectId)
  }
  return [] // rlh_selection table not yet provisioned
}

// ── Bid Packages ──────────────────────────────────────────────
// Table rlh_bidpackage does not exist in Dataverse yet.

export async function getBidPackages(projectId: string): Promise<BidPackage[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_BID_PACKAGES.filter(bp => bp.projectId === projectId)
  }
  return [] // rlh_bidpackage table not yet provisioned
}

// ── Action Items (`rlh_tasks`) ────────────────────────────────
// Table rlh_task does not exist in Dataverse yet.

export async function getTasks(projectId: string): Promise<Task[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_TASKS.filter(t => t.projectId === projectId)
  }
  return [] // rlh_task table not yet provisioned
}

// ── Expectations ──────────────────────────────────────────────
// Table rlh_expectation does not exist in Dataverse yet.

export async function getExpectations(): Promise<Expectation[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_EXPECTATIONS
  }
  return [] // rlh_expectation table not yet provisioned
}

export async function createProjectExpectation(projectId: string, data: { description: string; category: ExpectationCategory; tradeTypeId?: string }): Promise<void> {
  if (IS_MOCK) {
    const m = await mock()
    const expId = `exp-${Date.now()}`
    const newExp: Expectation = {
      id: expId,
      description: data.description,
      category: data.category,
      tradeTypeId: data.tradeTypeId,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    m.MOCK_EXPECTATIONS.push(newExp)
    const pe: ProjectExpectation = {
      id: `pe-${expId}`,
      projectId,
      expectationId: expId,
      expectation: newExp,
      isIncluded: true,
      sortOrder: m.MOCK_PROJECT_EXPECTATIONS.filter(p => p.projectId === projectId).length + 1,
      source: 'manual',
    }
    m.MOCK_PROJECT_EXPECTATIONS.push(pe)
  }
}

// Table rlh_projectexpectation does not exist in Dataverse yet.
export async function getProjectExpectations(projectId: string): Promise<ProjectExpectation[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_PROJECT_EXPECTATIONS.filter(pe => pe.projectId === projectId)
  }
  return [] // rlh_projectexpectation table not yet provisioned
}

// ── File references ──────────────────────────────────────────
// Table rlh_file does not exist in Dataverse yet.

export async function getProjectFileReferences(projectId: string): Promise<ProjectFile[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_PROJECT_FILES.filter(
      (file) => file.projectId === projectId && file.registrationState === 'registered'
    )
  }
  return [] // rlh_file table not yet provisioned
}

// ── Companies ────────────────────────────────────────────────

export async function getCompanies(): Promise<Company[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_COMPANIES
  }
  // TODO: live query
  return []
}

export async function getCompany(companyId: string): Promise<Company | null> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_COMPANIES.find(c => c.id === companyId) ?? null
  }
  return null
}

export async function getCompanyTypes(): Promise<CompanyType[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_COMPANY_TYPES
  }
  return []
}

export async function getCapabilities(): Promise<Capability[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_CAPABILITIES
  }
  return []
}

export async function getCompanyCapabilities(): Promise<CompanyCapability[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_COMPANY_CAPABILITIES
  }
  return []
}

// ── Contacts ─────────────────────────────────────────────────

export async function getContacts(): Promise<Contact[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_CONTACTS
  }
  return []
}

export async function getContactRoles(): Promise<ContactRole[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_CONTACT_ROLES
  }
  return []
}

export async function getProjectContacts(projectId: string): Promise<ProjectContact[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_PROJECT_CONTACTS.filter(pc => pc.projectId === projectId)
  }
  return []
}

// ── Client ───────────────────────────────────────────────────

export async function getClient(clientId: string): Promise<Client | null> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_CLIENTS.find(client => client.id === clientId) ?? (m.MOCK_CLIENT.id === clientId ? m.MOCK_CLIENT : null)
  }
  return null
}

// ── Change Orders ────────────────────────────────────────────

export async function getChangeOrders(projectId: string): Promise<ChangeOrder[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_CHANGE_ORDERS.filter(co => co.projectId === projectId)
  }
  return []
}

// ── RFIs ─────────────────────────────────────────────────────

export async function getRfis(projectId: string): Promise<Rfi[]> {
  if (IS_MOCK) {
    const m = await mock()
    return m.MOCK_RFIS.filter(rfi => rfi.projectId === projectId)
  }
  return []
}

// ── Quotes ───────────────────────────────────────────────────

export async function getQuotes(bidPackageId?: string): Promise<Quote[]> {
  if (IS_MOCK) {
    const m = await mock()
    if (bidPackageId) return m.MOCK_QUOTES.filter(q => q.bidPackageId === bidPackageId)
    return m.MOCK_QUOTES
  }
  return []
}
