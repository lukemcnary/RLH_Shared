// ============================================================
// Mock Data
// ============================================================
//
// The app still exports mutable domain collections from this file,
// but the starting dataset is now built from Dataverse-shaped
// fixtures in lib/dataverse/mock-fixtures.ts and shared mapper
// helpers in lib/dataverse/mappers.ts.
// ============================================================

import type {
  BidPackage,
  Capability,
  ChangeOrder,
  Client,
  Company,
  CompanyCapability,
  CompanyType,
  Contact,
  ContactRole,
  CostCode,
  CostItem,
  Expectation,
  Gate,
  Mobilization,
  Project,
  ProjectContact,
  ProjectExpectation,
  ProjectFile,
  ProjectTrade,
  Quote,
  Rfi,
  ScopeDetail,
  ScopeItem,
  Selection,
  SequencerData,
  Space,
  Task,
  TradeType,
} from '@/types/database'
import {
  PRIMARY_CLIENT_ID,
  PRIMARY_PROJECT_ID,
  RAW_BID_PACKAGES,
  RAW_BID_PACKAGE_COST_ITEMS,
  RAW_CAPABILITIES,
  RAW_CLIENTS,
  RAW_COMPANIES,
  RAW_COMPANY_CAPABILITIES,
  RAW_COMPANY_COMPANY_TYPES,
  RAW_COMPANY_TRADE_TYPES,
  RAW_COMPANY_TYPES,
  RAW_CONTACTS,
  RAW_CONTACT_ROLES,
  RAW_COST_CODES,
  RAW_COST_ITEMS,
  RAW_COST_ITEM_SCOPE_ITEMS,
  RAW_COST_ITEM_SPACES,
  RAW_EXPECTATIONS,
  RAW_FILE_LINKS,
  RAW_GATES,
  RAW_MOBILIZATIONS,
  RAW_PROJECTS,
  RAW_PROJECT_CONTACTS,
  RAW_PROJECT_EXPECTATIONS,
  RAW_PROJECT_TRADES,
  RAW_QUOTES,
  RAW_REGISTERED_FILES,
  RAW_SCOPE_DETAILS,
  RAW_SCOPE_ITEMS,
  RAW_SCOPE_ITEM_SCOPE_DETAILS,
  RAW_SCOPE_ITEM_SPACES,
  RAW_SELECTIONS,
  RAW_SELECTION_COST_ITEMS,
  RAW_SELECTION_SPACES,
  RAW_SHAREPOINT_ONLY_FILES,
  RAW_SPACES,
  RAW_TASKS,
  RAW_TRADE_ITEMS,
  RAW_TRADE_TYPES,
  RAW_MOBILIZATION_MARKERS,
} from '@/lib/dataverse/mock-fixtures'
import {
  toBidPackage,
  toCapability,
  toClient,
  toCompany,
  toCompanyCapability,
  toCompanyType,
  toContact,
  toContactRole,
  toCostCode,
  toCostItem,
  toExpectation,
  toGate,
  toMobilization,
  toMobilizationMarker,
  toProject,
  toProjectContact,
  toProjectExpectation,
  toProjectFile,
  toProjectFileLink,
  toProjectTrade,
  toQuote,
  toScopeDetail,
  toScopeItem,
  toSelection,
  toSpace,
  toTask,
  toTradeItem,
  toTradeType,
} from '@/lib/dataverse/mappers'

function defined<T>(value: T | undefined | null): value is T {
  return value != null
}

function groupValues<T>(items: T[], key: (item: T) => string, value: (item: T) => string) {
  const map = new Map<string, string[]>()
  for (const item of items) {
    const mapKey = key(item)
    const existing = map.get(mapKey) ?? []
    existing.push(value(item))
    map.set(mapKey, existing)
  }
  return map
}

const SCOPE_ITEM_STATUSES: Record<string, 'draft' | 'confirmed'> = {
  'scope-item-001': 'confirmed',
  'scope-item-002': 'draft',
  'scope-item-003': 'confirmed',
  'scope-item-004': 'confirmed',
  'scope-item-005': 'draft',
}

const SCOPE_ITEM_COORDINATION_TRADE_IDS: Record<string, string[]> = {
  'scope-item-001': ['trade-electrical', 'trade-hvac'],
  'scope-item-002': ['trade-plumbing'],
  'scope-item-003': ['trade-cabinets'],
  'scope-item-004': ['trade-framing', 'trade-plumbing'],
  'scope-item-005': ['trade-cabinets', 'trade-flooring'],
}

// ── Core lookups ─────────────────────────────────────────────

export const MOCK_TRADE_TYPES: TradeType[] = RAW_TRADE_TYPES.map(toTradeType)
const tradeTypeById = new Map(MOCK_TRADE_TYPES.map((tradeType) => [tradeType.id, tradeType]))

export const MOCK_COST_CODES: CostCode[] = RAW_COST_CODES.map(toCostCode)
const costCodeById = new Map(MOCK_COST_CODES.map((costCode) => [costCode.id, costCode]))

export const MOCK_COMPANY_TYPES: CompanyType[] = RAW_COMPANY_TYPES.map(toCompanyType)
const companyTypeById = new Map(MOCK_COMPANY_TYPES.map((companyType) => [companyType.id, companyType]))

const companyTypeIdsByCompany = groupValues(
  RAW_COMPANY_COMPANY_TYPES,
  (item) => item._rlh_company_value,
  (item) => item._rlh_companytype_value,
)

const tradeTypeIdsByCompany = groupValues(
  RAW_COMPANY_TRADE_TYPES,
  (item) => item._rlh_company_value,
  (item) => item._rlh_tradetype_value,
)

export const MOCK_COMPANIES: Company[] = RAW_COMPANIES.map((rawCompany) => {
  const company = toCompany(rawCompany)
  const companyTypeIds = companyTypeIdsByCompany.get(company.id) ?? []
  const linkedTradeTypeIds = tradeTypeIdsByCompany.get(company.id) ?? []

  return {
    ...company,
    companyTypeIds,
    companyTypes: companyTypeIds.map((id) => companyTypeById.get(id)).filter(defined),
    tradeTypeIds: linkedTradeTypeIds,
    tradeTypes: linkedTradeTypeIds.map((id) => tradeTypeById.get(id)).filter(defined),
  }
})
const companyById = new Map(MOCK_COMPANIES.map((company) => [company.id, company]))

export const MOCK_CONTACTS: Contact[] = RAW_CONTACTS.map((rawContact) => {
  const contact = toContact(rawContact)
  return {
    ...contact,
    company: contact.companyId ? companyById.get(contact.companyId) : undefined,
  }
})
const contactById = new Map(MOCK_CONTACTS.map((contact) => [contact.id, contact]))

export const MOCK_CONTACT_ROLES: ContactRole[] = RAW_CONTACT_ROLES.map(toContactRole)
const contactRoleById = new Map(MOCK_CONTACT_ROLES.map((contactRole) => [contactRole.id, contactRole]))

export const MOCK_CAPABILITIES: Capability[] = RAW_CAPABILITIES.map(toCapability).map((capability) => ({
  ...capability,
  tradeType: capability.tradeTypeId ? tradeTypeById.get(capability.tradeTypeId) : undefined,
}))
const capabilityById = new Map(MOCK_CAPABILITIES.map((capability) => [capability.id, capability]))

export const MOCK_COMPANY_CAPABILITIES: CompanyCapability[] = RAW_COMPANY_CAPABILITIES.map((rawCompanyCapability) => {
  const companyCapability = toCompanyCapability(rawCompanyCapability)
  return {
    ...companyCapability,
    capability: capabilityById.get(companyCapability.capabilityId),
  }
})

export const MOCK_CLIENTS: Client[] = RAW_CLIENTS.map(toClient)
const clientById = new Map(MOCK_CLIENTS.map((client) => [client.id, client]))
export const MOCK_CLIENT: Client = clientById.get(PRIMARY_CLIENT_ID) ?? MOCK_CLIENTS[0] ?? { id: '', name: '', status: 'new' }

export const MOCK_PROJECTS: Project[] = RAW_PROJECTS.map((rawProject) => {
  const project = toProject(rawProject)
  return {
    ...project,
    client: project.clientId ? clientById.get(project.clientId) : undefined,
  }
})
const projectById = new Map(MOCK_PROJECTS.map((project) => [project.id, project]))

export const MOCK_PROJECT_CONTACTS: ProjectContact[] = RAW_PROJECT_CONTACTS.map((rawProjectContact) => {
  const projectContact = toProjectContact(rawProjectContact)
  return {
    ...projectContact,
    contact: contactById.get(projectContact.contactId),
    contactRole: projectContact.contactRoleId ? contactRoleById.get(projectContact.contactRoleId) : undefined,
  }
})

export const MOCK_SPACES: Space[] = RAW_SPACES.map(toSpace)
const spaceById = new Map(MOCK_SPACES.map((space) => [space.id, space]))

export const MOCK_SCOPE_DETAILS: ScopeDetail[] = RAW_SCOPE_DETAILS.map((rawScopeDetail) => {
  const scopeDetail = toScopeDetail(rawScopeDetail)
  return {
    ...scopeDetail,
    space: scopeDetail.spaceId ? spaceById.get(scopeDetail.spaceId) : undefined,
    tradeType: scopeDetail.tradeTypeId ? tradeTypeById.get(scopeDetail.tradeTypeId) : undefined,
  }
})
const scopeDetailById = new Map(MOCK_SCOPE_DETAILS.map((scopeDetail) => [scopeDetail.id, scopeDetail]))

const scopeDetailIdsByScopeItem = groupValues(
  RAW_SCOPE_ITEM_SCOPE_DETAILS,
  (item) => item._rlh_scopeitem_value,
  (item) => item._rlh_scopedetail_value,
)

const spaceIdsByScopeItem = groupValues(
  RAW_SCOPE_ITEM_SPACES,
  (item) => item._rlh_scopeitem_value,
  (item) => item._rlh_space_value,
)

const scopeItemIdsByCostItem = groupValues(
  RAW_COST_ITEM_SCOPE_ITEMS,
  (item) => item._rlh_costitem_value,
  (item) => item._rlh_scopeitem_value,
)

const costItemIdsByScopeItem = groupValues(
  RAW_COST_ITEM_SCOPE_ITEMS,
  (item) => item._rlh_scopeitem_value,
  (item) => item._rlh_costitem_value,
)

const spaceIdsByCostItem = groupValues(
  RAW_COST_ITEM_SPACES,
  (item) => item._rlh_costitem_value,
  (item) => item._rlh_space_value,
)

export const MOCK_COST_ITEMS: CostItem[] = RAW_COST_ITEMS.map((rawCostItem) => {
  const costItem = toCostItem(rawCostItem)
  const linkedScopeItemIds = scopeItemIdsByCostItem.get(costItem.id) ?? []
  const linkedSpaceIds = spaceIdsByCostItem.get(costItem.id) ?? []
  const primarySpaceId = linkedSpaceIds[0] ?? costItem.spaceId

  return {
    ...costItem,
    scopeItemId: linkedScopeItemIds[0],
    tradeType: costItem.tradeTypeId ? tradeTypeById.get(costItem.tradeTypeId) : undefined,
    costCode: costItem.costCodeId ? costCodeById.get(costItem.costCodeId) : undefined,
    spaceId: primarySpaceId,
    space: primarySpaceId ? spaceById.get(primarySpaceId) : undefined,
  }
})
const costItemById = new Map(MOCK_COST_ITEMS.map((costItem) => [costItem.id, costItem]))

export const MOCK_SCOPE_ITEMS: ScopeItem[] = RAW_SCOPE_ITEMS.map((rawScopeItem) => {
  const scopeItem = toScopeItem(rawScopeItem)
  const linkedScopeDetailIds = scopeDetailIdsByScopeItem.get(scopeItem.id) ?? []
  const linkedSpaceIds = spaceIdsByScopeItem.get(scopeItem.id) ?? []
  const linkedCostItemIds = costItemIdsByScopeItem.get(scopeItem.id) ?? []
  const coordinationTradeIds = SCOPE_ITEM_COORDINATION_TRADE_IDS[scopeItem.id] ?? []

  return {
    ...scopeItem,
    status: SCOPE_ITEM_STATUSES[scopeItem.id],
    tradeType: scopeItem.tradeTypeId ? tradeTypeById.get(scopeItem.tradeTypeId) : undefined,
    costCode: scopeItem.costCodeId ? costCodeById.get(scopeItem.costCodeId) : undefined,
    coordinationTrades: coordinationTradeIds.map((tradeId) => tradeTypeById.get(tradeId)).filter(defined),
    spaces: linkedSpaceIds.map((spaceId) => spaceById.get(spaceId)).filter(defined),
    scopeDetails: linkedScopeDetailIds.map((scopeDetailId) => {
      const scopeDetail = scopeDetailById.get(scopeDetailId)
      return {
        id: scopeDetailId,
        name: scopeDetail?.content ?? scopeDetailId,
      }
    }),
    costItems: linkedCostItemIds
      .map((costItemId) => costItemById.get(costItemId))
      .filter(defined)
      .map((costItem) => ({ id: costItem.id, name: costItem.name })),
  }
})

const costItemIdsByBidPackage = groupValues(
  RAW_BID_PACKAGE_COST_ITEMS,
  (item) => item._rlh_bidpackage_value,
  (item) => item._rlh_costitem_value,
)

export const MOCK_BID_PACKAGES: BidPackage[] = RAW_BID_PACKAGES.map((rawBidPackage) => {
  const bidPackage = toBidPackage(rawBidPackage)
  return {
    ...bidPackage,
    tradeType: bidPackage.tradeTypeId ? tradeTypeById.get(bidPackage.tradeTypeId) : undefined,
    awardedCompany: bidPackage.awardedCompanyId ? companyById.get(bidPackage.awardedCompanyId) : undefined,
    costItemIds: costItemIdsByBidPackage.get(bidPackage.id) ?? [],
  }
})

export const MOCK_QUOTES: Quote[] = RAW_QUOTES.map((rawQuote) => {
  const quote = toQuote(rawQuote)
  return {
    ...quote,
    company: companyById.get(quote.companyId),
  }
})

const costItemIdsBySelection = groupValues(
  RAW_SELECTION_COST_ITEMS,
  (item) => item._rlh_selection_value,
  (item) => item._rlh_costitem_value,
)

const spaceIdsBySelection = groupValues(
  RAW_SELECTION_SPACES,
  (item) => item._rlh_selection_value,
  (item) => item._rlh_space_value,
)

export const MOCK_SELECTIONS: Selection[] = RAW_SELECTIONS.map((rawSelection) => {
  const selection = toSelection(rawSelection)
  const linkedCostItemIds = costItemIdsBySelection.get(selection.id) ?? []
  const linkedSpaceIds = spaceIdsBySelection.get(selection.id) ?? []

  return {
    ...selection,
    tradeType: selection.tradeTypeId ? tradeTypeById.get(selection.tradeTypeId) : undefined,
    space: selection.spaceId ? spaceById.get(selection.spaceId) : undefined,
    spaces: linkedSpaceIds.map((spaceId) => spaceById.get(spaceId)).filter(defined),
    costItems: linkedCostItemIds
      .map((costItemId) => costItemById.get(costItemId))
      .filter(defined)
      .map((costItem) => ({
        id: costItem.id,
        name: costItem.name,
        tradeType: costItem.tradeType,
      })),
    supplierCompany: selection.vendorCompanyId
      ? {
          id: selection.vendorCompanyId,
          name: companyById.get(selection.vendorCompanyId)?.name ?? 'Unknown company',
        }
      : undefined,
  }
})

export const MOCK_GATES: Gate[] = RAW_GATES.map(toGate)
const gateById = new Map(MOCK_GATES.map((gate) => [gate.id, gate]))

export const MOCK_PROJECT_TRADES: ProjectTrade[] = RAW_PROJECT_TRADES.map((rawProjectTrade) => {
  const projectTrade = toProjectTrade(rawProjectTrade)
  return {
    ...projectTrade,
    company: projectTrade.companyId ? companyById.get(projectTrade.companyId) : undefined,
  }
})

const tradeItemsByMobilization = new Map<string, ReturnType<typeof toTradeItem>[]>()
for (const rawTradeItem of RAW_TRADE_ITEMS) {
  const mobilizationId = rawTradeItem._cr6cd_mobilizationsid_value ?? rawTradeItem._rlh_mobilization_value
  if (!mobilizationId) continue
  const existing = tradeItemsByMobilization.get(mobilizationId) ?? []
  existing.push(toTradeItem(rawTradeItem))
  tradeItemsByMobilization.set(mobilizationId, existing)
}

const markersByMobilization = new Map<string, ReturnType<typeof toMobilizationMarker>[]>()
for (const rawMarker of RAW_MOBILIZATION_MARKERS) {
  const mobilizationId = rawMarker._cr6cd_mobilizationsid_value ?? rawMarker._cr720_mobilization_value
  if (!mobilizationId) continue
  const existing = markersByMobilization.get(mobilizationId) ?? []
  existing.push(toMobilizationMarker(rawMarker))
  markersByMobilization.set(mobilizationId, existing)
}

export const MOCK_MOBILIZATIONS: Mobilization[] = RAW_MOBILIZATIONS.map((rawMobilization) => {
  const mobilizationId = rawMobilization.cr6cd_mobilizationsid ?? rawMobilization.cr6cd_mobilizationid ?? ''
  const projectTradeId = rawMobilization._cr6cd_projecttrade_value ?? rawMobilization._rlh_projecttradeid_value

  return toMobilization(
    rawMobilization,
    MOCK_PROJECT_TRADES.find((projectTrade) => projectTrade.id === projectTradeId),
    tradeItemsByMobilization.get(mobilizationId) ?? [],
    markersByMobilization.get(mobilizationId) ?? [],
  )
})
const mobilizationById = new Map(MOCK_MOBILIZATIONS.map((mobilization) => [mobilization.id, mobilization]))

export const MOCK_TASKS: Task[] = RAW_TASKS.map((rawTask) => {
  const task = toTask(rawTask)
  const mobilization = task.mobilizationId ? mobilizationById.get(task.mobilizationId) : undefined

  return {
    ...task,
    gateId: mobilization?.gateId ?? gateById.get(task.gateId ?? '')?.id,
  }
})

export const MOCK_EXPECTATIONS: Expectation[] = RAW_EXPECTATIONS.map((rawExpectation) => {
  const expectation = toExpectation(rawExpectation)
  return {
    ...expectation,
    tradeType: expectation.tradeTypeId ? tradeTypeById.get(expectation.tradeTypeId) : undefined,
  }
})
const expectationById = new Map(MOCK_EXPECTATIONS.map((expectation) => [expectation.id, expectation]))

export const MOCK_PROJECT_EXPECTATIONS: ProjectExpectation[] = RAW_PROJECT_EXPECTATIONS.map((rawProjectExpectation) => {
  const projectExpectation = toProjectExpectation(rawProjectExpectation)
  return {
    ...projectExpectation,
    expectation: expectationById.get(projectExpectation.expectationId),
  }
})

const linkedRecordsByFileId = new Map<string, ReturnType<typeof toProjectFileLink>[]>()
for (const rawFileLink of RAW_FILE_LINKS) {
  const link = toProjectFileLink(rawFileLink)
  const existing = linkedRecordsByFileId.get(link.fileId) ?? []
  existing.push(link)
  linkedRecordsByFileId.set(link.fileId, existing)
}

const registeredFiles = RAW_REGISTERED_FILES.map((rawFile) =>
  toProjectFile(rawFile, linkedRecordsByFileId.get(rawFile.rlh_fileid) ?? []),
)

const sharePointOnlyFiles: ProjectFile[] = RAW_SHAREPOINT_ONLY_FILES.map((file) => ({
  id: file.id,
  projectId: file.projectId,
  libraryKey: file.libraryKey,
  name: file.name,
  description: file.description,
  notes: file.notes,
  sharepointUrl: file.sharepointUrl,
  sharePointSiteId: file.sharePointSiteId,
  sharePointDriveId: file.sharePointDriveId,
  sharePointItemId: file.sharePointItemId,
  registrationState: 'sharepoint_only',
  fileSizeBytes: file.fileSizeBytes,
  mimeType: file.mimeType,
  createdAt: file.createdAt,
  modifiedAt: file.modifiedAt,
  linkedRecords: [],
}))

export const MOCK_PROJECT_FILES: ProjectFile[] = [...registeredFiles, ...sharePointOnlyFiles]

export const MOCK_CHANGE_ORDERS: ChangeOrder[] = []
export const MOCK_RFIS: Rfi[] = []

export const MOCK_SEQUENCER_DATA: SequencerData = {
  project: projectById.get(PRIMARY_PROJECT_ID) ?? { id: '', name: '', status: 'planning' },
  gates: MOCK_GATES.filter((gate) => gate.projectId === PRIMARY_PROJECT_ID),
  projectTrades: MOCK_PROJECT_TRADES.filter((projectTrade) => projectTrade.projectId === PRIMARY_PROJECT_ID),
  mobilizations: MOCK_MOBILIZATIONS.filter((mobilization) => mobilization.projectId === PRIMARY_PROJECT_ID),
}

// ── Helpers ──────────────────────────────────────────────────

export function offsetToDate(offset: number, projectStartDate: string): Date {
  const start = new Date(projectStartDate + 'T00:00:00')
  const result = new Date(start)
  result.setDate(result.getDate() + offset)
  return result
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
