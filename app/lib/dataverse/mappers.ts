import type {
  BidPackage,
  BidPackageStatus,
  Capability,
  CapabilityRating,
  Client,
  ClientStatus,
  Company,
  CompanyCapability,
  CompanyType,
  Contact,
  ContactRole,
  CostCode,
  CostItem,
  CostItemSource,
  CostItemStatus,
  Expectation,
  ExpectationCategory,
  Gate,
  GateLockStatus,
  Mobilization,
  MobilizationMarker,
  MobilizationStatus,
  Project,
  ProjectContact,
  ProjectExpectation,
  ProjectExpectationSource,
  ProjectFile,
  ProjectFileLink,
  ProjectStatus,
  ProjectTrade,
  ProjectTradeStage,
  Quote,
  QuoteStatus,
  ScopeDetail,
  ScopeDetailType,
  ScopeItem,
  Selection,
  SelectionProcurement,
  SelectionStatus,
  Space,
  Task,
  TaskStatus,
  TradeItem,
  TradeScope,
  TradeItemStatus,
  TradeItemType,
  TradeType,
} from '@/types/database'

function firstDefined<T>(...values: Array<T | undefined>): T | undefined {
  return values.find((value) => value !== undefined)
}

function dateOnly(value?: string) {
  return value?.slice(0, 10)
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []

  const raw = value.trim()
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function stringOrUndefined(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function numberOrUndefined(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function normalizeTradeItemType(value: unknown): TradeItemType | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    switch (value) {
      case 936880000:
        return 'prep'
      case 936880001:
        return 'decision'
      case 936880002:
        return 'question'
      case 936880003:
        return 'action'
      case 936880004:
        return 'risk'
      default:
        return undefined
    }
  }

  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  switch (normalized) {
    case 'prep':
    case 'decision':
    case 'question':
    case 'action':
    case 'risk':
      return normalized
    default:
      return undefined
  }
}

function normalizeTradeItemStatus(value: unknown): TradeItemStatus | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    switch (value) {
      case 936880000:
        return 'open'
      case 936880001:
        return 'closed'
      default:
        return undefined
    }
  }

  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''
  switch (normalized) {
    case 'open':
    case 'closed':
      return normalized
    default:
      return undefined
  }
}

const PROJECT_STATUS_MAP: Record<number, ProjectStatus> = {
  936880000: 'planning',
  936880001: 'active',
  936880002: 'complete',
  936880003: 'on_hold',
}

const GATE_LOCK_MAP: Record<number, GateLockStatus> = {
  936880000: 'unlocked',
  936880001: 'soft_lock',
  936880002: 'hard_lock',
}

const PROJECT_TRADE_STAGE_MAP: Record<number, ProjectTradeStage> = {
  936880000: 'planned',
  936880001: 'in_progress',
  936880002: 'complete',
}

const MOBILIZATION_STATUS_MAP: Record<number, MobilizationStatus> = {
  936880000: 'draft',
  936880001: 'confirmed',
  936880002: 'in_progress',
  936880003: 'complete',
}

const COST_ITEM_STATUS_MAP: Record<number, CostItemStatus> = {
  936880000: 'pending',
  936880001: 'scoped',
  936880002: 'in_bid',
  936880003: 'awarded',
  936880004: 'in_progress',
  936880005: 'complete',
}

const COST_ITEM_SOURCE_MAP: Record<number, CostItemSource> = {
  936880000: 'manual',
  936880001: 'from_scope_item',
  936880002: 'from_ai',
}

const SCOPE_DETAIL_TYPE_MAP: Record<number, ScopeDetailType> = {
  936880000: 'specification',
  936880001: 'coordination',
  936880002: 'note',
  936880003: 'dimension',
}

const SELECTION_STATUS_MAP: Record<number, SelectionStatus> = {
  936880000: 'pending',
  936880001: 'specified',
  936880002: 'approved',
  936880003: 'ordered',
  936880004: 'delivered',
  936880005: 'installed',
}

const SELECTION_PROCUREMENT_MAP: Record<number, SelectionProcurement> = {
  936880000: 'builder',
  936880001: 'trade',
  936880002: 'vendor',
}

const BID_PACKAGE_STATUS_MAP: Record<number, BidPackageStatus> = {
  936880000: 'draft',
  936880001: 'sent',
  936880002: 'reviewing',
  936880003: 'awarded',
}

const EXPECTATION_CATEGORY_MAP: Record<number, ExpectationCategory> = {
  936880000: 'general',
  936880001: 'communication',
  936880002: 'site_conditions',
  936880003: 'preparation_coordination',
  936880004: 'quality_standards',
}

const PROJECT_EXPECTATION_SOURCE_MAP: Record<number, ProjectExpectationSource> = {
  936880000: 'auto',
  936880001: 'manual',
}

const TASK_STATUS_MAP: Record<number, TaskStatus> = {
  936880000: 'open',
  936880001: 'in_progress',
  936880002: 'complete',
  936880003: 'blocked',
}

const CLIENT_STATUS_MAP: Record<number, ClientStatus> = {
  936880000: 'new',
  936880001: 'contacted',
  936880002: 'qualified',
  936880003: 'agreement_signed',
  936880004: 'converted',
}

const QUOTE_STATUS_MAP: Record<number, QuoteStatus> = {
  936880000: 'pending',
  936880001: 'accepted',
  936880002: 'rejected',
}

const COMPANY_CAPABILITY_RATING_MAP: Record<number, CapabilityRating> = {
  936880000: 'unknown',
  936880001: 'basic',
  936880002: 'competent',
  936880003: 'strong',
  936880004: 'preferred',
}

export interface DvProject {
  cr6cd_projectid: string
  cr6cd_name?: string
  cr6cd_projectname?: string
  cr6cd_location?: string
  rlh_address?: string
  cr6cd_startdate?: string
  cr6cd_completiondate?: string
  cr6cd_enddate?: string
  cr6cd_status?: number
  rlh_status?: number
  cr6cd_description?: string
  cr6cd_gatedeclarationsjson?: string
  cr6cd_holidaysjson?: string
  _rlh_client_value?: string
  rlh_sharepointsiteurl?: string
  rlh_sharepointsiteid?: string
  createdon?: string
  modifiedon?: string
}

// cr6cd_status uses a different picklist range than the rlh_status the schema
// plan originally assumed.  Real observed values: 3 = "Under Construction".
const CR6CD_PROJECT_STATUS_MAP: Record<number, ProjectStatus> = {
  1: 'planning',
  2: 'planning',
  3: 'active',      // "Under Construction"
  4: 'complete',
  5: 'on_hold',
}

export function toProject(dv: DvProject): Project {
  const statusCode = dv.cr6cd_status ?? dv.rlh_status
  const status = statusCode !== undefined
    ? (CR6CD_PROJECT_STATUS_MAP[statusCode] ?? PROJECT_STATUS_MAP[statusCode] ?? 'active')
    : 'active'

  return {
    id: dv.cr6cd_projectid,
    name: firstDefined(dv.cr6cd_projectname, dv.cr6cd_name) ?? '(unnamed project)',
    address: firstDefined(dv.cr6cd_location, dv.rlh_address),
    startDate: dateOnly(dv.cr6cd_startdate),
    completionDate: dateOnly(firstDefined(dv.cr6cd_enddate, dv.cr6cd_completiondate)),
    status,
    clientId: dv._rlh_client_value,
    sharePointSiteUrl: dv.rlh_sharepointsiteurl,
    sharePointSiteId: dv.rlh_sharepointsiteid,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvTrade {
  cr6cd_tradeid: string
  cr6cd_name?: string
  cr6cd_tradename?: string
  cr6cd_tradecode?: string
  cr6cd_color?: string
}

export function toTradeType(dv: DvTrade): TradeType {
  const name = firstDefined(dv.cr6cd_tradename, dv.cr6cd_name) ?? '(unnamed trade)'
  return {
    id: dv.cr6cd_tradeid,
    name,
    code: dv.cr6cd_tradecode ?? name.slice(0, 3).toUpperCase(),
    color: dv.cr6cd_color,
  }
}

export interface DvBuildPhase {
  cr6cd_buildphaseid: string
  cr6cd_name?: string
  cr6cd_buildphasename?: string
  cr6cd_sortorder?: number
  cr6cd_sequenceorder?: number
  cr6cd_description?: string
  rlh_lockstatus?: number
  rlh_workingwindowstart?: string
  rlh_workingwindowend?: string
  rlh_declaredwindowstart?: string
  rlh_declaredwindowend?: string
  _cr6cd_projectid_value?: string
  _rlh_project_value?: string
}

export function toGate(dv: DvBuildPhase): Gate {
  return {
    id: dv.cr6cd_buildphaseid,
    projectId: firstDefined(dv._cr6cd_projectid_value, dv._rlh_project_value) ?? '',
    name: firstDefined(dv.cr6cd_buildphasename, dv.cr6cd_name) ?? '(unnamed gate)',
    order: firstDefined(dv.cr6cd_sequenceorder, dv.cr6cd_sortorder) ?? 0,
    description: dv.cr6cd_description,
    lockStatus: GATE_LOCK_MAP[dv.rlh_lockstatus ?? 936880000] ?? 'unlocked',
    workingWindowStart: dateOnly(dv.rlh_workingwindowstart),
    workingWindowEnd: dateOnly(dv.rlh_workingwindowend),
    declaredWindowStart: dateOnly(dv.rlh_declaredwindowstart),
    declaredWindowEnd: dateOnly(dv.rlh_declaredwindowend),
  }
}

export interface DvProjectTrade {
  rlh_projecttradeid: string
  _rlh_project_value?: string
  _rlh_projectid_value?: string
  _rlh_trade_value?: string
  _cr6cd_tradeid_value?: string
  rlh_externalid?: string
  rlh_newcolumn?: string
  rlh_stage?: number
  _cr720_partnerlookup_value?: string
  _rlh_companyid_value?: string
  cr6cd_tradeid?: DvTrade
}

export function toProjectTrade(dv: DvProjectTrade, joinedTradeType?: TradeType): ProjectTrade {
  const tradeTypeId = firstDefined(dv._rlh_trade_value, dv._cr6cd_tradeid_value, dv.rlh_externalid) ?? ''
  const tradeType = dv.cr6cd_tradeid
    ? toTradeType(dv.cr6cd_tradeid)
    : joinedTradeType ?? {
        id: tradeTypeId,
        name: dv.rlh_newcolumn ?? '(unknown trade)',
        code: (dv.rlh_newcolumn ?? tradeTypeId ?? '???').slice(0, 3).toUpperCase(),
      }

  return {
    id: dv.rlh_projecttradeid,
    projectId: firstDefined(dv._rlh_projectid_value, dv._rlh_project_value) ?? '',
    tradeTypeId,
    tradeType,
    stage: PROJECT_TRADE_STAGE_MAP[dv.rlh_stage ?? 936880000] ?? 'planned',
    companyId: firstDefined(dv._cr720_partnerlookup_value, dv._rlh_companyid_value),
  }
}

export interface DvMobilization {
  cr6cd_mobilizationid?: string
  cr6cd_mobilizationsid?: string
  _cr6cd_project_value?: string
  _cr6cd_projectid_value?: string
  _rlh_project_value?: string
  _cr6cd_buildphase_value?: string
  _cr6cd_buildphaseid_value?: string
  _cr6cd_projecttrade_value?: string
  _rlh_projecttradeid_value?: string
  _cr6cd_trade_value?: string
  cr6cd_why?: string
  cr6cd_notes?: string
  cr6cd_newcolumn?: string
  rlh_why?: string
  cr6cd_startoffset?: number
  cr6cd_durationdays?: number
  cr6cd_displayorder?: number
  cr6cd_stepsjson?: string | unknown[]
  cr6cd_markersjson?: string | unknown[]
  rlh_status?: number
  rlh_projecttradeid?: {
    rlh_projecttradeid: string
    cr6cd_tradeid?: DvTrade
  }
}

export interface DvTradeItem {
  rlh_tradeitemid: string
  _rlh_mobilization_value?: string
  _cr6cd_mobilizationsid_value?: string
  rlh_name?: string
  rlh_text?: string
  rlh_newcolumn?: string
  rlh_answer?: string
  rlh_notes?: string
  rlh_externalid?: string
  rlh_sortorder?: number
  rlh_type?: string | number
  rlh_status?: string | number
}

export interface DvTradeScope {
  rlh_tradescopeid: string
  rlh_newcolumn?: string
  rlh_externalid?: string
  rlh_notes?: string
  rlh_displayorder?: number
  _rlh_projecttrade_value?: string
  _rlh_partnerlookup_value?: string
  _rlh_mobilization_value?: string
}

export interface DvMobilizationMarker {
  cr6cd_mobilizationmarkersid: string
  _cr720_mobilization_value?: string
  _cr6cd_mobilization_value?: string
  _cr6cd_mobilizationsid_value?: string
  cr6cd_name?: string
  cr6cd_newcolumn?: string
  cr720_notes?: string
  cr6cd_notes?: string
  cr6cd_position?: number
  rlh_position?: number
}

export function toTradeItem(dv: DvTradeItem): TradeItem {
  return {
    id: dv.rlh_tradeitemid,
    mobilizationId: firstDefined(dv._rlh_mobilization_value, dv._cr6cd_mobilizationsid_value) ?? '',
    name: firstDefined(dv.rlh_name, dv.rlh_text, dv.rlh_newcolumn) ?? '',
    notes: firstDefined(dv.rlh_notes, dv.rlh_answer),
    type: normalizeTradeItemType(dv.rlh_type),
    status: normalizeTradeItemStatus(dv.rlh_status),
    sortOrder: dv.rlh_sortorder ?? 0,
  }
}

export function toMobilizationMarker(dv: DvMobilizationMarker): MobilizationMarker {
  return {
    id: dv.cr6cd_mobilizationmarkersid,
    mobilizationId: firstDefined(
      dv._cr720_mobilization_value,
      dv._cr6cd_mobilization_value,
      dv._cr6cd_mobilizationsid_value,
    ) ?? '',
    label: firstDefined(dv.cr6cd_newcolumn, dv.cr6cd_name) ?? '',
    notes: firstDefined(dv.cr720_notes, dv.cr6cd_notes),
    position: firstDefined(dv.cr6cd_position, dv.rlh_position) ?? 0.5,
  }
}

export function toTradeScope(
  dv: DvTradeScope,
  gateId?: string,
): TradeScope {
  return {
    id: firstDefined(dv.rlh_externalid, dv.rlh_tradescopeid) ?? dv.rlh_tradescopeid,
    projectTradeId: dv._rlh_projecttrade_value ?? '',
    gateId,
    mobilizationId: dv._rlh_mobilization_value,
    name: dv.rlh_newcolumn ?? '(unnamed scope)',
    notes: dv.rlh_notes,
    sortOrder: dv.rlh_displayorder ?? 0,
    partnerCompanyId: dv._rlh_partnerlookup_value,
  }
}

function toTradeItemsFromProjection(rawSteps: unknown, mobilizationId: string): TradeItem[] {
  return parseJsonArray(rawSteps)
    .map((rawStep, index) => {
      if (!rawStep || typeof rawStep !== 'object') return null

      const step = rawStep as Record<string, unknown>
      const name = firstDefined(
        stringOrUndefined(step.name),
        stringOrUndefined(step.short),
        stringOrUndefined(step.text),
      )?.trim()

      if (!name) return null

      return {
        id: String(step.id ?? `${mobilizationId}-step-${index + 1}`),
        mobilizationId,
        name,
        notes: firstDefined(
          stringOrUndefined(step.notes),
          stringOrUndefined(step.answer),
        ),
        type: normalizeTradeItemType(step.type),
        status: normalizeTradeItemStatus(step.status),
        sortOrder: numberOrUndefined(step.sortOrder) ?? index + 1,
      } as TradeItem
    })
    .filter((step): step is TradeItem => step !== null)
}

function toMarkersFromProjection(rawMarkers: unknown, mobilizationId: string): MobilizationMarker[] {
  return parseJsonArray(rawMarkers)
    .map((rawMarker, index) => {
      if (!rawMarker || typeof rawMarker !== 'object') return null

      const marker = rawMarker as Record<string, unknown>
      const label = firstDefined(
        stringOrUndefined(marker.label),
        stringOrUndefined(marker.text),
        stringOrUndefined(marker.cr6cd_newcolumn),
      )?.trim()

      if (!label) return null

      return {
        id: String(marker.id ?? `${mobilizationId}-marker-${index + 1}`),
        mobilizationId,
        label,
        notes: firstDefined(
          stringOrUndefined(marker.notes),
          stringOrUndefined(marker.cr720_notes),
        ),
        position: numberOrUndefined(marker.position) ?? numberOrUndefined(marker.pos) ?? 0.5,
      } as MobilizationMarker
    })
    .filter((marker): marker is MobilizationMarker => marker !== null)
}

export function toMobilization(
  dv: DvMobilization,
  projectTrade?: ProjectTrade,
  steps: TradeItem[] = [],
  markers: MobilizationMarker[] = [],
): Mobilization {
  const mobilizationId = firstDefined(dv.cr6cd_mobilizationid, dv.cr6cd_mobilizationsid) ?? ''
  const projectTradeId = firstDefined(dv._cr6cd_projecttrade_value, dv._rlh_projecttradeid_value) ?? ''
  const tradeType = dv.rlh_projecttradeid?.cr6cd_tradeid
    ? toTradeType(dv.rlh_projecttradeid.cr6cd_tradeid)
    : projectTrade?.tradeType ?? {
        id: firstDefined(dv._cr6cd_trade_value, projectTradeId) ?? '',
        name: projectTrade?.tradeType.name ?? '(unknown trade)',
        code: projectTrade?.tradeType.code ?? '???',
        color: projectTrade?.tradeType.color,
      }
  // Compatibility bridge only: these embedded JSON blobs still feed the
  // raw/edit surface, but the sequencing engine derives runtime steps from
  // tradeScopes in the projector.
  const normalizedSteps = steps.length > 0 ? steps : toTradeItemsFromProjection(dv.cr6cd_stepsjson, mobilizationId)
  const normalizedMarkers = markers.length > 0 ? markers : toMarkersFromProjection(dv.cr6cd_markersjson, mobilizationId)

  return {
    id: mobilizationId,
    projectId: firstDefined(dv._cr6cd_projectid_value, dv._rlh_project_value) ?? '',
    gateId: firstDefined(dv._cr6cd_buildphase_value, dv._cr6cd_buildphaseid_value) ?? '',
    projectTradeId,
    tradeType,
    why: firstDefined(dv.cr6cd_why, dv.rlh_why) ?? '',
    status: MOBILIZATION_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'draft',
    startOffset: dv.cr6cd_startoffset ?? 0,
    duration: dv.cr6cd_durationdays ?? 5,
    displayOrder: dv.cr6cd_displayorder,
    steps: normalizedSteps,
    markers: normalizedMarkers,
  }
}

export interface DvCostCode {
  rlh_costcodeid: string
  rlh_code: string
  rlh_name: string
  rlh_fullcode?: string
  rlh_level?: number
  _rlh_parent_value?: string
  _rlh_parentcostcode_value?: string
  _rlh_tradetype_value?: string
  rlh_isscope?: boolean
  rlh_sortorder?: number
}

export function toCostCode(dv: DvCostCode): CostCode {
  return {
    id: dv.rlh_costcodeid,
    code: dv.rlh_code,
    fullCode: dv.rlh_fullcode ?? dv.rlh_code,
    name: dv.rlh_name,
    level: dv.rlh_level ?? 3,
    parentId: firstDefined(dv._rlh_parent_value, dv._rlh_parentcostcode_value),
    tradeTypeId: dv._rlh_tradetype_value,
    isScope: dv.rlh_isscope,
    sortOrder: dv.rlh_sortorder,
  }
}

export interface DvCostItem {
  rlh_costitemid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_description?: string
  rlh_status?: number
  rlh_source?: number
  rlh_estimatelow?: number
  rlh_estimatehigh?: number
  rlh_awardedamount?: number
  rlh_quotedcost?: number
  _rlh_tradetype_value?: string
  _rlh_costcode_value?: string
  _rlh_space_value?: string
  _rlh_bidpackage_value?: string
  rlh_notes?: string
  rlh_sortorder?: number
  createdon?: string
  modifiedon?: string
}

export function toCostItem(dv: DvCostItem): CostItem {
  return {
    id: dv.rlh_costitemid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    description: dv.rlh_description,
    status: COST_ITEM_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'pending',
    source: COST_ITEM_SOURCE_MAP[dv.rlh_source ?? 936880000] ?? 'manual',
    estimateLow: dv.rlh_estimatelow,
    estimateHigh: dv.rlh_estimatehigh,
    awardedAmount: firstDefined(dv.rlh_awardedamount, dv.rlh_quotedcost),
    tradeTypeId: dv._rlh_tradetype_value,
    costCodeId: dv._rlh_costcode_value,
    spaceId: dv._rlh_space_value,
    bidPackageId: dv._rlh_bidpackage_value,
    notes: dv.rlh_notes,
    sortOrder: dv.rlh_sortorder,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvScopeItem {
  rlh_scopeitemid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_description?: string
  _rlh_tradetype_value?: string
  _rlh_costcode_value?: string
  rlh_notes?: string
  rlh_sortorder?: number
  createdon?: string
  modifiedon?: string
}

export function toScopeItem(dv: DvScopeItem): ScopeItem {
  return {
    id: dv.rlh_scopeitemid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    description: dv.rlh_description,
    tradeTypeId: dv._rlh_tradetype_value,
    costCodeId: dv._rlh_costcode_value,
    notes: dv.rlh_notes,
    sortOrder: dv.rlh_sortorder,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvScopeDetail {
  rlh_scopedetailid: string
  _rlh_project_value: string
  rlh_content: string
  rlh_detailtype?: number
  rlh_speccode?: string
  _rlh_space_value?: string
  _rlh_tradetype_value?: string
  _rlh_costcode_value?: string
  rlh_notes?: string
  createdon?: string
}

export function toScopeDetail(dv: DvScopeDetail): ScopeDetail {
  return {
    id: dv.rlh_scopedetailid,
    projectId: dv._rlh_project_value,
    content: dv.rlh_content,
    detailType: SCOPE_DETAIL_TYPE_MAP[dv.rlh_detailtype ?? 936880000] ?? 'specification',
    specCode: dv.rlh_speccode,
    spaceId: dv._rlh_space_value,
    tradeTypeId: dv._rlh_tradetype_value,
    costCodeId: dv._rlh_costcode_value,
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
  }
}

export interface DvSelection {
  rlh_selectionid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_category?: string
  rlh_description?: string
  rlh_status?: number
  rlh_procurementresponsibility?: number
  rlh_speccode?: string
  rlh_manufacturer?: string
  rlh_model?: string
  rlh_modelnumber?: string
  rlh_finish?: string
  rlh_color?: string
  rlh_quantity?: number
  rlh_unit?: string
  rlh_unitcost?: number
  rlh_totalcost?: number
  rlh_leadtimedays?: number
  rlh_duedate?: string
  rlh_ordereddate?: string
  rlh_delivereddate?: string
  _rlh_tradetype_value?: string
  _rlh_space_value?: string
  _rlh_costitem_value?: string
  _rlh_vendorcompany_value?: string
  _rlh_supplier_value?: string
  rlh_notes?: string
  createdon?: string
  modifiedon?: string
}

export function toSelection(dv: DvSelection): Selection {
  return {
    id: dv.rlh_selectionid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    category: dv.rlh_category,
    description: dv.rlh_description,
    status: SELECTION_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'pending',
    procurementResponsibility: SELECTION_PROCUREMENT_MAP[dv.rlh_procurementresponsibility ?? 936880000] ?? 'builder',
    specCode: dv.rlh_speccode,
    manufacturer: dv.rlh_manufacturer,
    model: firstDefined(dv.rlh_model, dv.rlh_modelnumber),
    finish: dv.rlh_finish,
    color: dv.rlh_color,
    quantity: dv.rlh_quantity,
    unit: dv.rlh_unit,
    unitCost: dv.rlh_unitcost,
    totalCost: dv.rlh_totalcost,
    leadTimeDays: dv.rlh_leadtimedays,
    dueDate: dateOnly(dv.rlh_duedate),
    orderedDate: dateOnly(dv.rlh_ordereddate),
    deliveredDate: dateOnly(dv.rlh_delivereddate),
    tradeTypeId: dv._rlh_tradetype_value,
    spaceId: dv._rlh_space_value,
    costItemId: dv._rlh_costitem_value,
    vendorCompanyId: firstDefined(dv._rlh_vendorcompany_value, dv._rlh_supplier_value),
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvBidPackage {
  rlh_bidpackageid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_status?: number
  _rlh_tradetype_value?: string
  rlh_description?: string
  rlh_duedate?: string
  rlh_sentdate?: string
  rlh_awardeddate?: string
  _rlh_awardedcompany_value?: string
  _rlh_company_value?: string
  rlh_notes?: string
  createdon?: string
  modifiedon?: string
}

export function toBidPackage(dv: DvBidPackage): BidPackage {
  return {
    id: dv.rlh_bidpackageid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    status: BID_PACKAGE_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'draft',
    tradeTypeId: dv._rlh_tradetype_value,
    description: dv.rlh_description,
    dueDate: dateOnly(dv.rlh_duedate),
    sentDate: dateOnly(dv.rlh_sentdate),
    awardedDate: dateOnly(dv.rlh_awardeddate),
    awardedCompanyId: firstDefined(dv._rlh_awardedcompany_value, dv._rlh_company_value),
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvExpectation {
  rlh_expectationid: string
  rlh_description: string
  rlh_category?: number
  _rlh_tradetype_value?: string
  rlh_isactive?: boolean
  createdon?: string
  modifiedon?: string
}

export function toExpectation(dv: DvExpectation): Expectation {
  return {
    id: dv.rlh_expectationid,
    description: dv.rlh_description,
    category: EXPECTATION_CATEGORY_MAP[dv.rlh_category ?? 936880000] ?? 'general',
    tradeTypeId: dv._rlh_tradetype_value,
    isActive: dv.rlh_isactive ?? true,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvProjectExpectation {
  rlh_projectexpectationid: string
  _rlh_project_value: string
  _rlh_expectation_value: string
  rlh_isincluded?: boolean
  rlh_customtext?: string
  rlh_sortorder?: number
  rlh_source?: number
}

export function toProjectExpectation(dv: DvProjectExpectation): ProjectExpectation {
  return {
    id: dv.rlh_projectexpectationid,
    projectId: dv._rlh_project_value,
    expectationId: dv._rlh_expectation_value,
    isIncluded: dv.rlh_isincluded ?? true,
    customText: dv.rlh_customtext,
    sortOrder: dv.rlh_sortorder,
    source: PROJECT_EXPECTATION_SOURCE_MAP[dv.rlh_source ?? 936880000] ?? 'auto',
  }
}

export interface DvTask {
  rlh_taskid: string
  _rlh_project_value: string
  _rlh_mobilization_value?: string
  rlh_ismarker?: boolean
  rlh_name: string
  rlh_description?: string
  rlh_notes?: string
  rlh_status?: number
  _rlh_assignee_value?: string
  rlh_duedate?: string
  rlh_completeddate?: string
  _rlh_tradetype_value?: string
  _rlh_scopeitem_value?: string
  _rlh_costitem_value?: string
  _rlh_projecttrade_value?: string
  createdon?: string
}

export function toTask(dv: DvTask): Task {
  return {
    id: dv.rlh_taskid,
    projectId: dv._rlh_project_value,
    mobilizationId: dv._rlh_mobilization_value,
    scopeItemId: dv._rlh_scopeitem_value,
    costItemId: dv._rlh_costitem_value,
    projectTradeId: dv._rlh_projecttrade_value,
    isMarker: dv.rlh_ismarker ?? false,
    name: dv.rlh_name,
    description: firstDefined(dv.rlh_description, dv.rlh_notes),
    status: TASK_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'open',
    assigneeContactId: dv._rlh_assignee_value,
    dueDate: dateOnly(dv.rlh_duedate),
    completedDate: dateOnly(dv.rlh_completeddate),
    tradeTypeId: dv._rlh_tradetype_value,
    createdAt: dv.createdon,
  }
}

export interface DvProjectFile {
  rlh_fileid: string
  rlh_filename: string
  rlh_sharepointurl?: string
  rlh_filetype?: string
  rlh_filesize?: number
  rlh_notes?: string
  rlh_description?: string
  rlh_librarykey?: ProjectFile['libraryKey']
  rlh_sharepointsiteid?: string
  rlh_sharepointdriveid?: string
  rlh_sharepointitemid?: string
  createdon?: string
  modifiedon?: string
  _rlh_project_value: string
}

export interface DvProjectFileLink {
  rlh_filelinkid: string
  rlh_linkedrecordtype?: string
  rlh_linkedrecordid?: string
  rlh_linkedrecordlabel?: string
  _rlh_file_value?: string
}

export function toProjectFileLink(dv: DvProjectFileLink): ProjectFileLink {
  return {
    id: dv.rlh_filelinkid,
    fileId: dv._rlh_file_value ?? '',
    linkedRecordType: dv.rlh_linkedrecordtype ?? '',
    linkedRecordId: dv.rlh_linkedrecordid ?? '',
    linkedRecordLabel: dv.rlh_linkedrecordlabel,
  }
}

export function toProjectFile(dv: DvProjectFile, linkedRecords: ProjectFileLink[]): ProjectFile {
  return {
    id: dv.rlh_fileid,
    registeredFileId: dv.rlh_fileid,
    projectId: dv._rlh_project_value,
    libraryKey: dv.rlh_librarykey ?? 'admin_files',
    name: dv.rlh_filename,
    description: dv.rlh_description,
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

export interface DvClient {
  rlh_clientid: string
  rlh_firstname?: string
  rlh_lastname?: string
  rlh_name?: string
  rlh_email?: string
  rlh_phone?: string
  rlh_status?: number
  rlh_notes?: string
  rlh_projectaddress?: string
  rlh_projectdescription?: string
  rlh_source?: string
  _rlh_company_value?: string
  createdon?: string
  modifiedon?: string
}

export function toClient(dv: DvClient): Client {
  const fullName = dv.rlh_name ?? [dv.rlh_firstname, dv.rlh_lastname].filter(Boolean).join(' ').trim()
  return {
    id: dv.rlh_clientid,
    name: fullName || '(unnamed client)',
    email: dv.rlh_email,
    phone: dv.rlh_phone,
    status: CLIENT_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'new',
    projectAddress: dv.rlh_projectaddress,
    projectDescription: dv.rlh_projectdescription,
    source: dv.rlh_source,
    notes: dv.rlh_notes,
    companyId: dv._rlh_company_value,
    createdAt: dv.createdon,
    updatedAt: dv.modifiedon,
  }
}

export interface DvCompany {
  accountid: string
  name: string
  telephone1?: string
  emailaddress1?: string
  websiteurl?: string
  address1_composite?: string
  createdon?: string
}

export function toCompany(dv: DvCompany): Company {
  return {
    id: dv.accountid,
    name: dv.name,
    phone: dv.telephone1,
    email: dv.emailaddress1,
    address: dv.address1_composite,
    website: dv.websiteurl,
    createdAt: dv.createdon,
  }
}

export interface DvCompanyType {
  rlh_companytypeid: string
  rlh_name: string
}

export function toCompanyType(dv: DvCompanyType): CompanyType {
  return {
    id: dv.rlh_companytypeid,
    name: dv.rlh_name,
  }
}

export interface DvContact {
  contactid: string
  fullname?: string
  firstname?: string
  lastname?: string
  emailaddress1?: string
  mobilephone?: string
  jobtitle?: string
  _parentcustomerid_value?: string
  createdon?: string
}

export function toContact(dv: DvContact): Contact {
  const fullName = dv.fullname ?? [dv.firstname, dv.lastname].filter(Boolean).join(' ').trim()
  return {
    id: dv.contactid,
    firstName: dv.firstname ?? '',
    lastName: dv.lastname ?? '',
    fullName: fullName || '(unnamed contact)',
    email: dv.emailaddress1,
    phone: dv.mobilephone,
    title: dv.jobtitle,
    companyId: dv._parentcustomerid_value,
    createdAt: dv.createdon,
  }
}

export interface DvContactRole {
  rlh_contactroleid: string
  rlh_name: string
}

export function toContactRole(dv: DvContactRole): ContactRole {
  return {
    id: dv.rlh_contactroleid,
    name: dv.rlh_name,
  }
}

export interface DvCapability {
  rlh_capabilityid: string
  rlh_name: string
  rlh_description?: string
  _rlh_tradetype_value: string
}

export function toCapability(dv: DvCapability): Capability {
  return {
    id: dv.rlh_capabilityid,
    name: dv.rlh_name,
    description: dv.rlh_description,
    tradeTypeId: dv._rlh_tradetype_value,
  }
}

export interface DvCompanyCapability {
  rlh_company_capabilityid: string
  _rlh_company_value: string
  _rlh_capability_value: string
  rlh_rating?: number
}

export function toCompanyCapability(dv: DvCompanyCapability): CompanyCapability {
  return {
    id: dv.rlh_company_capabilityid,
    companyId: dv._rlh_company_value,
    capabilityId: dv._rlh_capability_value,
    rating: COMPANY_CAPABILITY_RATING_MAP[dv.rlh_rating ?? 936880000] ?? 'unknown',
  }
}

export interface DvProjectContact {
  rlh_projectcontactid: string
  _rlh_project_value: string
  _rlh_contact_value: string
  _rlh_contactrole_value?: string
}

export function toProjectContact(dv: DvProjectContact): ProjectContact {
  return {
    id: dv.rlh_projectcontactid,
    projectId: dv._rlh_project_value,
    contactId: dv._rlh_contact_value,
    contactRoleId: dv._rlh_contactrole_value,
  }
}

export interface DvQuote {
  rlh_quoteid: string
  _rlh_bidpackage_value: string
  _rlh_company_value: string
  rlh_totalamount?: number
  rlh_status?: number
  rlh_submitteddate?: string
  rlh_validuntil?: string
  rlh_notes?: string
  createdon?: string
}

export function toQuote(dv: DvQuote): Quote {
  return {
    id: dv.rlh_quoteid,
    bidPackageId: dv._rlh_bidpackage_value,
    companyId: dv._rlh_company_value,
    status: QUOTE_STATUS_MAP[dv.rlh_status ?? 936880000] ?? 'pending',
    amount: dv.rlh_totalamount,
    receivedDate: dateOnly(dv.rlh_submitteddate),
    validUntil: dateOnly(dv.rlh_validuntil),
    notes: dv.rlh_notes,
    createdAt: dv.createdon,
  }
}

export interface DvSpace {
  rlh_spaceid: string
  _rlh_project_value: string
  rlh_name: string
  rlh_notes?: string
  rlh_level?: string
  rlh_sortorder?: number
}

export function toSpace(dv: DvSpace): Space {
  return {
    id: dv.rlh_spaceid,
    projectId: dv._rlh_project_value,
    name: dv.rlh_name,
    description: dv.rlh_notes,
    level: dv.rlh_level,
    sortOrder: dv.rlh_sortorder,
  }
}
