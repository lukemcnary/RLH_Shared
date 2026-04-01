// ============================================================
// Shared App — Unified Project Domain Types
// ============================================================
//
// This is the single source of truth for ALL domain types in
// the shared app. Project records stay as peers under the
// project container and link together where needed.
//
// Design rules:
//   - These types are PLATFORM-NEUTRAL. No Dataverse field
//     names, no OData, no cr6cd_ or rlh_ prefixes.
//   - Dataverse shapes live only in lib/dataverse/queries/*.ts
//   - Primary keys are always `id` (not `projectId`)
//   - Foreign keys are `[entity]Id` (e.g. gateId, projectId)
//   - Timestamps: createdAt, updatedAt (ISO strings)
//   - Boolean flags: is[Thing] (e.g. isMarker, isScope)
//
// Table of contents:
//   1. Primitives
//   2. Status constants
//   3. Shared / common objects (Company, Contact)
//   4. Project-level planning records
//   5. Project-level commercial records
//   6. Project-level delivery records
//   7. Joined / view types
//   8. Server action payloads
//   9. UI-only types (never persisted)
// ============================================================


// ─── 1. Primitives ──────────────────────────────────────────

/** ISO-8601 date string: "2025-03-03" */
export type ISODate = string

/** ISO-8601 datetime string: "2025-03-03T14:00:00Z" */
export type ISODateTime = string

/** Dataverse GUID string */
export type DvGuid = string


// ─── 2. Status constants ─────────────────────────────────────
// Status fields use string literals in domain types.
// The adapter maps between these and Dataverse picklist integers.
// Picklist base in Trevor's environment: 936880000

// Project
export type ProjectStatus = 'planning' | 'active' | 'complete' | 'on_hold'

// Client / lead
export type ClientStatus = 'new' | 'contacted' | 'qualified' | 'agreement_signed' | 'converted'

export const CLIENT_LEAD_STATUSES = ['new', 'contacted', 'qualified', 'agreement_signed', 'converted'] as const

export const CLIENT_BOARD_STATUSES = ['new', 'contacted', 'qualified', 'agreement_signed'] as const

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  agreement_signed: 'Agreement Signed',
  converted: 'Converted',
}

// Gate lock
export type GateLockStatus = 'unlocked' | 'soft_lock' | 'hard_lock'

// Cost item lifecycle
export type CostItemStatus = 'pending' | 'scoped' | 'in_bid' | 'awarded' | 'in_progress' | 'complete'
export type CostItemSource = 'manual' | 'from_scope_item' | 'from_ai'

// Selection lifecycle
export type SelectionStatus = 'pending' | 'specified' | 'approved' | 'ordered' | 'delivered' | 'installed'
export type SelectionProcurement = 'builder' | 'trade' | 'vendor'

// Scope detail type
export type ScopeDetailType = 'specification' | 'coordination' | 'note' | 'dimension'

// Bid package lifecycle
export type BidPackageStatus = 'draft' | 'sent' | 'reviewing' | 'awarded'

// Quote decision
export type QuoteStatus = 'pending' | 'accepted' | 'rejected'

// Project trade stage
export type ProjectTradeStage = 'planned' | 'in_progress' | 'complete'

// Mobilization lifecycle
export type MobilizationStatus = 'draft' | 'confirmed' | 'in_progress' | 'complete'

// Trade item (action item) type and status
export type TradeItemType = 'prep' | 'decision' | 'question' | 'action' | 'risk'
export type TradeItemStatus = 'open' | 'closed'

// Task
export type TaskStatus = 'open' | 'in_progress' | 'complete' | 'blocked'

// Change order
export type ChangeOrderDirection = 'trade_to_builder' | 'builder_to_client' | 'internal'
export type ChangeOrderStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

// RFI
export type RfiStatus = 'open' | 'answered' | 'closed'

// Files
export type ProjectFileLibraryKey =
  | 'drawing_files'
  | 'model_files'
  | 'trade_files'
  | 'field_files'
  | 'admin_files'
export type ProjectFileRegistrationState = 'registered' | 'sharepoint_only'

// Expectation
export type ExpectationCategory = 'general' | 'communication' | 'site_conditions' | 'preparation_coordination' | 'quality_standards'
export type ProjectExpectationSource = 'auto' | 'manual'


// ─── 3. Shared / common objects ──────────────────────────────

/**
 * Company — a vendor, subcontractor, or client company.
 * Dataverse: accounts (system table)
 */
export interface Company {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  website?: string
  tradeTypeIds?: string[]
  tradeTypes?: TradeType[]
  companyTypeIds?: string[]
  companyTypes?: CompanyType[]
  createdAt?: ISODateTime
}

/**
 * CompanyType — canonical label for how a company participates (Subcontractor, Vendor, etc.).
 * Dataverse: rlh_companytypes (new)
 */
export interface CompanyType {
  id: string
  name: string
}

/**
 * CompanyCompanyType — junction linking a company to its type classifications.
 * Dataverse: rlh_company_companytypes (new)
 */
export interface CompanyCompanyType {
  id: string
  companyId: string
  companyTypeId: string
}

/**
 * Capability — a narrow specialization within a trade type.
 * Dataverse: rlh_capabilities (new)
 */
export interface Capability {
  id: string
  name: string
  description?: string
  tradeTypeId: string
}

/**
 * CompanyCapability — junction linking a company to a capability with a proficiency rating.
 * Dataverse: rlh_company_capabilities (new)
 */
export type CapabilityRating = 'unknown' | 'basic' | 'competent' | 'strong' | 'preferred'

export interface CompanyCapability {
  id: string
  companyId: string
  capabilityId: string
  capability?: Capability
  rating: CapabilityRating
}

/**
 * Contact — a person associated with a company.
 * Dataverse: contacts (system table)
 */
export interface Contact {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  phone?: string
  title?: string
  companyId?: string
  company?: Company
  createdAt?: ISODateTime
}

/**
 * ContactRole — canonical role label for contacts.
 * Dataverse: rlh_contactroles (new)
 */
export interface ContactRole {
  id: string
  name: string
}

/**
 * ProjectContact — junction linking a contact to a project with an optional role.
 * Dataverse: rlh_projectcontacts (new)
 */
export interface ProjectContact {
  id: string
  projectId: string
  contactId: string
  contactRoleId?: string
  contact?: Contact
  contactRole?: ContactRole
}

/**
 * TradeType — a type of construction trade (master list, not project-specific).
 * Dataverse: cr6cd_trades
 */
export interface TradeType {
  id: string
  name: string      // "Electrical", "Plumbing", …
  code: string      // "ELC", "PLM" — short display code
  color?: string    // hex color for timeline bars
}


// ─── 4. Project-level planning records ───────────────────────

/**
 * Client — a lead or client relationship.
 * Dataverse: rlh_clients (new)
 */
export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  status: ClientStatus
  projectAddress?: string
  projectDescription?: string
  source?: string
  notes?: string
  companyId?: string
  company?: Company
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}

/**
 * Project — a construction project.
 * Dataverse: cr6cd_projects (Trevor's table + new rlh_ fields)
 */
export interface Project {
  id: string
  name: string
  address?: string
  startDate?: ISODate
  completionDate?: ISODate
  status: ProjectStatus
  clientId?: string
  client?: Client
  gateCode?: string
  wifiPassword?: string
  hoursOfOperation?: string
  permitNumber?: string
  sharePointSiteUrl?: string
  sharePointSiteId?: string
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}

/**
 * Space — a named area within a project (e.g. "Primary Bath", "Kitchen").
 * Dataverse: rlh_spaces (new)
 */
export interface Space {
  id: string
  projectId: string
  name: string
  description?: string
  level?: string   // "1st Floor", "Basement", etc.
  sortOrder?: number
}

/**
 * CostCode — hierarchical cost code (org-level, shared across projects).
 * Dataverse: rlh_costcodes (new)
 */
export interface CostCode {
  id: string
  code: string        // short code segment, e.g. "03", "100"
  fullCode: string    // full hyphenated code, e.g. "03", "03-100", "03-100-01"
  name: string        // "Concrete Forming", "Drywall"
  level: number       // 1 = top-level division, 2 = section, 3 = line item
  parentId?: string   // parent cost code id for hierarchy
  tradeTypeId?: string
  isScope?: boolean   // marks scope-bearing codes
  sortOrder?: number
}

/**
 * ScopeDetail — an atomic fact extracted from plans.
 * These are the raw building blocks that feed project scope.
 * Dataverse: rlh_scopedetails (new)
 */
export interface ScopeDetail {
  id: string
  projectId: string
  detailType: ScopeDetailType
  content: string        // the atomic fact
  specCode?: string      // e.g. "PL-1", "CA-3"
  spaceId?: string
  space?: Space
  tradeTypeId?: string
  tradeType?: TradeType
  costCodeId?: string
  notes?: string
  createdAt?: ISODateTime
}

/**
 * ScopeItem — internal type for Project Scope, a trade-ready work description built from scope details.
 * Sits between raw scope details and cost items.
 * Dataverse: rlh_scopeitems (new)
 */
export interface ScopeItem {
  id: string
  projectId: string
  name: string             // short trade-ready description (maps to luke/'s "title")
  description?: string     // longer content (maps to luke/'s "content")
  status?: 'draft' | 'confirmed'
  source?: string
  sortOrder?: number
  tradeTypeId?: string
  tradeType?: TradeType
  // Joined arrays (populated by adapter)
  coordinationTrades?: TradeType[]   // other trades that need to coordinate
  spaces?: Space[]                   // spaces this project-scope item applies to
  scopeDetails?: { id: string; name: string }[]  // linked scope details
  costItems?: { id: string; name: string }[]      // linked cost items
  costCodeId?: string
  costCode?: CostCode
  notes?: string
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}

/**
 * CostItem — the primary financial line item for a project.
 * One cost item = one thing to budget, bid, and track.
 * Dataverse: rlh_costitems (new)
 */
export interface CostItem {
  id: string
  projectId: string
  name: string
  description?: string
  status: CostItemStatus
  source: CostItemSource
  estimateLow?: number
  estimateHigh?: number
  awardedAmount?: number
  tradeTypeId?: string
  tradeType?: TradeType
  costCodeId?: string
  costCode?: CostCode
  spaceId?: string
  space?: Space
  scopeItemId?: string     // the project-scope item this cost item was generated from
  bidPackageId?: string    // set when awarded to a bid package
  notes?: string
  sortOrder?: number
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}

/**
 * Selection — a material or product choice that must be made.
 * Dataverse: rlh_selections (new)
 */
export interface Selection {
  id: string
  projectId: string
  name: string
  category?: string
  status: SelectionStatus
  procurementResponsibility: SelectionProcurement
  specCode?: string
  manufacturer?: string
  product?: string      // product name/model
  model?: string
  colorFinish?: string  // combined color/finish field
  finish?: string
  color?: string
  size?: string
  link?: string
  description?: string
  quantity?: number
  unit?: string
  unitCost?: number
  totalCost?: number
  leadTimeDays?: number
  dueDate?: ISODate
  orderedDate?: ISODate
  deliveredDate?: ISODate
  tradeTypeId?: string
  tradeType?: TradeType
  spaceId?: string
  space?: Space
  // Joined arrays
  spaces?: Space[]
  costItems?: { id: string; name: string; tradeType?: TradeType }[]
  costItemId?: string
  vendorCompanyId?: string
  supplierCompany?: { id: string; name: string }
  notes?: string
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}


// ─── 5. Project-level commercial records ─────────────────────

/**
 * BidPackage — a collection of cost items sent to trade companies for quotes.
 * Dataverse: rlh_bidpackages (new)
 */
export interface BidPackage {
  id: string
  projectId: string
  name: string
  status: BidPackageStatus
  tradeTypeId?: string
  tradeType?: TradeType
  description?: string
  dueDate?: ISODate
  sentDate?: ISODate
  awardedDate?: ISODate
  awardedCompanyId?: string
  awardedCompany?: Company
  notes?: string
  costItemIds?: string[]
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}

/**
 * Quote — a response from a trade company to a bid package.
 * Dataverse: rlh_quotes (new)
 */
export interface Quote {
  id: string
  bidPackageId: string
  companyId: string
  company?: Company
  status: QuoteStatus
  amount?: number
  receivedDate?: ISODate
  validUntil?: ISODate
  notes?: string
  createdAt?: ISODateTime
}


// ─── 6. Project-level delivery records ───────────────────────

/**
 * Gate — a project-scoped gate record.
 * Current implementation source: cr6cd_buildphases (Trevor compatibility table).
 * Target shared model: project-level shared gate rows.
 */
export interface Gate {
  id: string
  projectId: string
  name: string              // "Gate 1" … "Gate 5"
  order: number             // 1-based sort order
  description?: string
  lockStatus: GateLockStatus
  workingWindowStart?: ISODate
  workingWindowEnd?: ISODate
  declaredWindowStart?: ISODate
  declaredWindowEnd?: ISODate
}

/**
 * ProjectTrade — thin project/trade junction used for compatibility
 * and assignment helpers, not as a parent planning container.
 * Dataverse: rlh_projecttrades
 */
export interface ProjectTrade {
  id: string
  projectId: string
  tradeTypeId: string
  tradeType: TradeType     // always joined
  stage: ProjectTradeStage
  companyId?: string
  company?: Company
}

/**
 * Mobilization — one scheduled trade visit in one project gate.
 * This is the main time container used by the sequencer board.
 * Dataverse: cr6cd_mobilizations (Trevor's table + rlh_status field)
 *
 * Timeline is stored as working-day offsets from the project start date.
 * The adapter converts Dataverse cr6cd_startoffset/cr6cd_durationdays
 * directly — no date math needed in the UI.
 */
export interface Mobilization {
  id: string
  projectId: string
  gateId: string
  projectTradeId: string
  tradeType: TradeType      // always joined

  /**
   * Builder's reasoning for this mobilization.
   * Most important field — Trevor calls this "why".
   * Dataverse: cr6cd_why
   */
  why: string

  status: MobilizationStatus

  /** Working-day offset from project start. Day 0 = project start. */
  startOffset: number

  /** Duration in working days. */
  duration: number

  /**
   * Preferred visual row for the sequencer timeline.
   * Dataverse compatibility field: cr6cd_displayorder
   */
  displayOrder?: number

  /**
   * Compatibility step list used by the current modal/edit bridge.
   * Sequencing logic does not treat this as authoritative; runtime
   * steps are derived from tradeScopes in the projector.
   */
  steps: TradeItem[]

  /**
   * Compatibility markers currently persisted with the mobilization.
   * These still flow through the board, but they are not the primary
   * source for sequencing structure.
   */
  markers: MobilizationMarker[]
}

/**
 * MobilizationMarker — an inspection or milestone checkpoint
 * within a mobilization's duration bar.
 * Dataverse: cr6cd_mobilizationmarkerses (Trevor's table)
 */
export interface MobilizationMarker {
  id: string
  mobilizationId: string
  label: string
  notes?: string
  /**
   * Position within the mobilization bar as a fraction 0.0 → 1.0.
   * 0 = start of mobilization, 1 = end.
   */
  position: number
}

/**
 * TradeItem — one line item in the scope (PPP) section of a mobilization.
 * Dataverse: rlh_tradeitems (Trevor's table)
 */
export interface TradeItem {
  id: string
  mobilizationId: string
  name: string
  notes?: string
  type?: TradeItemType
  status?: TradeItemStatus
  sortOrder: number
  duration?: number
  startDay?: number
  endDay?: number
  sourceScopeId?: string
}

/**
 * TradeScope — the overall scope record for a trade within a gate.
 * Dataverse: rlh_tradescopes (Trevor's table)
 */
export interface TradeScope {
  id: string
  projectTradeId: string
  gateId?: string
  mobilizationId?: string
  name: string
  notes?: string
  sortOrder?: number
  duration?: number
  partnerCompanyId?: string
}

/**
 * TradeTemplate — org-level template for trade action items.
 * Dataverse: rlh_tradetemplates (Trevor's table)
 */
export interface TradeTemplate {
  id: string
  tradeTypeId: string
  tradeType?: TradeType
  name: string
  description?: string
  sortOrder?: number
}

/**
 * Task — internal type for Action Item, a project action item that can exist before or during field work.
 * Action items may optionally link to project scope, cost, gate, or mobilization records.
 * Markers are action items with isMarker = true.
 * Dataverse: rlh_tasks (new)
 */
export interface Task {
  id: string
  projectId: string
  gateId?: string
  mobilizationId?: string
  scopeItemId?: string
  costItemId?: string
  projectTradeId?: string
  isMarker: boolean
  name: string
  description?: string
  status: TaskStatus
  assigneeContactId?: string
  dueDate?: ISODate
  completedDate?: ISODate
  tradeTypeId?: string
  createdAt?: ISODateTime
}

/**
 * ChangeOrder — a change to the scope or cost after the contract.
 * Dataverse: rlh_changeorders (new)
 */
export interface ChangeOrder {
  id: string
  projectId: string
  name: string
  direction: ChangeOrderDirection
  status: ChangeOrderStatus
  amount?: number
  description?: string
  reason?: string
  submittedDate?: ISODate
  approvedDate?: ISODate
  createdAt?: ISODateTime
}

/**
 * Rfi — a Request for Information.
 * Dataverse: rlh_rfis (new)
 */
export interface Rfi {
  id: string
  projectId: string
  number?: number
  subject: string
  question: string
  answer?: string
  status: RfiStatus
  submittedByContactId?: string
  answeredByContactId?: string
  submittedDate?: ISODate
  answeredDate?: ISODate
  createdAt?: ISODateTime
}

/**
 * ProjectFile — merged file view used by the shared app.
 * SharePoint is authoritative for the file itself.
 * Dataverse stores lightweight references and optional record links.
 * Dataverse: rlh_files (new)
 */
export interface ProjectFile {
  id: string
  projectId: string
  libraryKey: ProjectFileLibraryKey
  name: string
  description?: string
  notes?: string
  sharepointUrl?: string
  sharePointSiteId?: string
  sharePointDriveId?: string
  sharePointItemId?: string
  registrationState: ProjectFileRegistrationState
  registeredFileId?: string
  fileSizeBytes?: number
  mimeType?: string
  createdAt?: ISODateTime
  modifiedAt?: ISODateTime
  linkedRecords?: ProjectFileLink[]
}

/**
 * ProjectFileLink — a file attached to a project record.
 * Dataverse: rlh_filelinks (new)
 */
export interface ProjectFileLink {
  id: string
  fileId: string
  linkedRecordType: string
  linkedRecordId: string
  linkedRecordLabel?: string
}

/**
 * Expectation — a short, actionable behavioral standard for how work
 * should be performed, coordinated, or quality-checked.
 * Org-level reusable record. Optionally scoped to a trade type.
 * Dataverse: rlh_expectations (new)
 */
export interface Expectation {
  id: string
  description: string
  category: ExpectationCategory
  tradeTypeId?: string
  tradeType?: TradeType
  isActive: boolean
  createdAt?: ISODateTime
  updatedAt?: ISODateTime
}

/**
 * ProjectExpectation — junction between a project and an expectation.
 * Records which expectations apply to a specific project, with optional
 * custom wording overrides, sort order, and source tracking.
 * Dataverse: rlh_projectexpectations (new)
 */
export interface ProjectExpectation {
  id: string
  projectId: string
  expectationId: string
  expectation?: Expectation       // joined from master
  isIncluded: boolean
  customText?: string             // override wording for this project
  sortOrder?: number
  source: ProjectExpectationSource
}


// ─── 7. Joined / view types ──────────────────────────────────
// These are what the UI actually receives. Suffix with With[Related].

/** Gate with its mobilizations pre-attached */
export type GateWithMobilizations = Gate & {
  mobilizations: Mobilization[]
}

/** ProjectTrade with its mobilizations for this project */
export type ProjectTradeWithMobilizations = ProjectTrade & {
  mobilizations: Mobilization[]
}

/** CostItem with trade type and cost code joined */
export type CostItemWithRelations = CostItem & {
  tradeType?: TradeType
  costCode?: CostCode
  space?: Space
}

/** BidPackage with its cost items */
export type BidPackageWithItems = BidPackage & {
  costItems: CostItem[]
  quotes: Quote[]
}

/** ScopeItem with its linked scope details */
export type ScopeItemWithDetails = ScopeItem & {
  scopeDetails: ScopeDetail[]
  spaces: Space[]
}

/**
 * SequencerData — the complete payload loaded from Dataverse (or mock)
 * and passed to the sequencer board as server-rendered props.
 *
 * The UI holds NO data of its own. Mutations go through Server Actions,
 * which call revalidatePath() to trigger a fresh server fetch.
 */
export interface SequencerData {
  project: Project
  gates: Gate[]
  projectTrades: ProjectTrade[]
  mobilizations: Mobilization[]
}

/**
 * ProjectExecutionData — canonical project-scoped input for sequencing logic.
 * This is the clean engine input assembled from the raw compatibility tables.
 * Mobilizations in this bundle intentionally strip compatibility step blobs;
 * runtime steps are derived from tradeScopes inside the projector.
 */
export interface ProjectExecutionData extends SequencerData {
  tradeScopes: TradeScope[]
}

export interface SequenceStepProjection extends TradeItem {
  duration: number
  startDay: number
  endDay: number
  sourceScopeId: string
}

export interface SequenceMobilizationProjection extends Omit<Mobilization, 'steps'> {
  scopes: TradeScope[]
  steps: SequenceStepProjection[]
  desiredStartOffset: number
  resolvedStartOffset: number
  projectedDuration: number
  derivedDuration: number
  resolvedEndOffset: number
}

export interface SequenceGateProjection {
  gate: Gate
  mobilizations: SequenceMobilizationProjection[]
  tradeCount: number
  stepCount: number
  markerCount: number
}

export interface SequenceTradeProjection {
  projectTrade: ProjectTrade
  mobilizations: SequenceMobilizationProjection[]
  gateIds: string[]
  stepCount: number
  markerCount: number
}

export interface SequenceProjection {
  projectId: string
  generatedAt: ISODateTime
  totals: {
    gateCount: number
    tradeCount: number
    mobilizationCount: number
    stepCount: number
    markerCount: number
    scopeCount: number
  }
  mobilizations: SequenceMobilizationProjection[]
  gates: SequenceGateProjection[]
  trades: SequenceTradeProjection[]
}

/**
 * ProjectData — minimal project info passed to the project layout sidebar.
 */
export interface ProjectData {
  project: Project
}


// ─── 8. Server action payloads ────────────────────────────────
// Shapes the UI sends to Server Actions.
// Intentionally omit server-managed fields (id, createdAt).

export interface CreateMobilizationPayload {
  projectId: string
  gateId: string
  projectTradeId: string
  why: string
  startOffset: number
  duration: number
  displayOrder?: number
  steps?: Omit<TradeItem, 'mobilizationId'>[]
  markers?: Omit<MobilizationMarker, 'mobilizationId'>[]
}

export interface UpdateMobilizationPayload {
  id: string
  gateId?: string
  projectTradeId?: string
  why?: string
  startOffset?: number
  duration?: number
  displayOrder?: number
  status?: MobilizationStatus
  steps?: Omit<TradeItem, 'mobilizationId'>[]
  markers?: Omit<MobilizationMarker, 'mobilizationId'>[]
}

export interface UpdateGatePayload {
  id: string
  description?: string
  lockStatus?: GateLockStatus
  workingWindowStart?: ISODate
  workingWindowEnd?: ISODate
  declaredWindowStart?: ISODate
  declaredWindowEnd?: ISODate
}

export interface CreateCostItemPayload {
  projectId: string
  name: string
  description?: string
  tradeTypeId?: string
  costCodeId?: string
  spaceId?: string
  source: CostItemSource
  estimateLow?: number
  estimateHigh?: number
}

export interface UpdateCostItemPayload {
  id: string
  name?: string
  description?: string
  status?: CostItemStatus
  tradeTypeId?: string
  costCodeId?: string
  spaceId?: string
  estimateLow?: number
  estimateHigh?: number
  awardedAmount?: number
  bidPackageId?: string
  notes?: string
}

export interface CreateSelectionPayload {
  projectId: string
  name: string
  category?: string
  procurementResponsibility: SelectionProcurement
  tradeTypeId?: string
  spaceId?: string
  costItemId?: string
}

export interface UpdateSelectionPayload {
  id: string
  name?: string
  status?: SelectionStatus
  procurementResponsibility?: SelectionProcurement
  specCode?: string
  manufacturer?: string
  model?: string
  finish?: string
  color?: string
  quantity?: number
  unit?: string
  unitCost?: number
  leadTimeDays?: number
  dueDate?: ISODate
  orderedDate?: ISODate
  deliveredDate?: ISODate
  vendorCompanyId?: string
  notes?: string
}

export interface CreateExpectationPayload {
  description: string
  category: ExpectationCategory
  tradeTypeId?: string
}

export interface UpdateProjectExpectationPayload {
  id: string
  isIncluded?: boolean
  customText?: string
  sortOrder?: number
}


export interface CreateChangeOrderPayload {
  projectId: string
  name: string
  description?: string
  direction: ChangeOrderDirection
  amount?: number
  notes?: string
}

export interface CreateRfiPayload {
  projectId: string
  subject: string
  question: string
  dueDate?: ISODate
}

export interface CreateTaskPayload {
  projectId: string
  name: string
  notes?: string
  isMarker?: boolean
  dueDate?: ISODate
  gateId?: string
  mobilizationId?: string
  scopeItemId?: string
  costItemId?: string
}

export interface UpdateTaskPayload {
  id: string
  name?: string
  notes?: string
  status?: TaskStatus
  isMarker?: boolean
  dueDate?: ISODate
  gateId?: string
  mobilizationId?: string
  scopeItemId?: string
  costItemId?: string
}

export interface CreateQuotePayload {
  bidPackageId: string
  companyId: string
  totalAmount: number
  notes?: string
}


// ─── 9. UI-only types (never persisted) ──────────────────────

export interface SequencerUIState {
  mode: 'project' | 'sequencing' | 'storyline' | 'trades'
  selectedMobilizationId: string | null
  activeGateId: string | null
  pxPerDay: number
  horizonDays: number
}
