import type {
  DvBidPackage,
  DvBuildPhase,
  DvCapability,
  DvClient,
  DvCompany,
  DvCompanyCapability,
  DvCompanyType,
  DvContact,
  DvContactRole,
  DvCostCode,
  DvCostItem,
  DvExpectation,
  DvMobilization,
  DvMobilizationMarker,
  DvProject,
  DvProjectContact,
  DvProjectExpectation,
  DvProjectFile,
  DvProjectFileLink,
  DvProjectTrade,
  DvQuote,
  DvScopeDetail,
  DvScopeItem,
  DvSelection,
  DvSpace,
  DvTask,
  DvTrade,
  DvTradeItem,
} from './mappers'
import type { ProjectFile } from '@/types/database'

export const PRIMARY_PROJECT_ID = 'proj-001'
export const PRIMARY_CLIENT_ID = 'client-001'

export interface DvCompanyCompanyType {
  rlh_company_companytypeid: string
  _rlh_company_value: string
  _rlh_companytype_value: string
}

export interface DvCompanyTradeType {
  rlh_company_tradetypeid: string
  _rlh_company_value: string
  _rlh_tradetype_value: string
}

export interface DvScopeItemScopeDetail {
  rlh_scopeitem_scopedetailid: string
  _rlh_scopeitem_value: string
  _rlh_scopedetail_value: string
}

export interface DvScopeItemSpace {
  rlh_scopeitem_spaceid: string
  _rlh_scopeitem_value: string
  _rlh_space_value: string
}

export interface DvCostItemScopeItem {
  rlh_costitem_scopeitemid: string
  _rlh_costitem_value: string
  _rlh_scopeitem_value: string
}

export interface DvCostItemSpace {
  rlh_costitem_spaceid: string
  _rlh_costitem_value: string
  _rlh_space_value: string
}

export interface DvBidPackageCostItem {
  rlh_bidpackage_costitemid: string
  _rlh_bidpackage_value: string
  _rlh_costitem_value: string
}

export interface DvBidPackageScopeItem {
  rlh_bidpackage_scopeitemid: string
  _rlh_bidpackage_value: string
  _rlh_scopeitem_value: string
}

export interface DvSelectionCostItem {
  rlh_selection_costitemid: string
  _rlh_selection_value: string
  _rlh_costitem_value: string
}

export interface DvSelectionSpace {
  rlh_selection_spaceid: string
  _rlh_selection_value: string
  _rlh_space_value: string
}

export interface MockSharePointOnlyFile {
  id: string
  projectId: string
  libraryKey: ProjectFile['libraryKey']
  name: string
  description?: string
  notes?: string
  sharepointUrl?: string
  sharePointSiteId: string
  sharePointDriveId: string
  sharePointItemId: string
  fileSizeBytes?: number
  mimeType?: string
  createdAt?: string
  modifiedAt?: string
}

export const RAW_TRADE_TYPES: DvTrade[] = [
  { cr6cd_tradeid: 'trade-excavation', cr6cd_tradename: 'Excavation', cr6cd_tradecode: 'EXC', cr6cd_color: '#8B6914' },
  { cr6cd_tradeid: 'trade-concrete', cr6cd_tradename: 'Concrete', cr6cd_tradecode: 'CON', cr6cd_color: '#6B6560' },
  { cr6cd_tradeid: 'trade-framing', cr6cd_tradename: 'Framing', cr6cd_tradecode: 'FRM', cr6cd_color: '#7A4F2E' },
  { cr6cd_tradeid: 'trade-roofing', cr6cd_tradename: 'Roofing', cr6cd_tradecode: 'ROF', cr6cd_color: '#2E4A6B' },
  { cr6cd_tradeid: 'trade-plumbing', cr6cd_tradename: 'Plumbing', cr6cd_tradecode: 'PLM', cr6cd_color: '#1A5E8A' },
  { cr6cd_tradeid: 'trade-hvac', cr6cd_tradename: 'HVAC', cr6cd_tradecode: 'HVC', cr6cd_color: '#2E6B4A' },
  { cr6cd_tradeid: 'trade-electrical', cr6cd_tradename: 'Electrical', cr6cd_tradecode: 'ELC', cr6cd_color: '#7A6B1A' },
  { cr6cd_tradeid: 'trade-insulation', cr6cd_tradename: 'Insulation', cr6cd_tradecode: 'INS', cr6cd_color: '#5E3A7A' },
  { cr6cd_tradeid: 'trade-drywall', cr6cd_tradename: 'Drywall', cr6cd_tradecode: 'DRY', cr6cd_color: '#7A5E4A' },
  { cr6cd_tradeid: 'trade-flooring', cr6cd_tradename: 'Flooring', cr6cd_tradecode: 'FLR', cr6cd_color: '#4A7A5E' },
  { cr6cd_tradeid: 'trade-tile', cr6cd_tradename: 'Tile', cr6cd_tradecode: 'TIL', cr6cd_color: '#6B4A7A' },
  { cr6cd_tradeid: 'trade-cabinets', cr6cd_tradename: 'Cabinets', cr6cd_tradecode: 'CAB', cr6cd_color: '#7A6A3A' },
  { cr6cd_tradeid: 'trade-paint', cr6cd_tradename: 'Paint', cr6cd_tradecode: 'PNT', cr6cd_color: '#3A6A7A' },
  { cr6cd_tradeid: 'trade-trim', cr6cd_tradename: 'Trim & Millwork', cr6cd_tradecode: 'TRM', cr6cd_color: '#6A3A4A' },
]

function trade(tradeId: string): DvTrade {
  const match = RAW_TRADE_TYPES.find((item) => item.cr6cd_tradeid === tradeId)
  if (!match) throw new Error(`Unknown trade fixture: ${tradeId}`)
  return match
}

function expandedProjectTrade(projectTradeId: string, tradeId: string) {
  return {
    rlh_projecttradeid: projectTradeId,
    cr6cd_tradeid: trade(tradeId),
  }
}

export const RAW_COST_CODES: DvCostCode[] = [
  { rlh_costcodeid: 'cc-div-02', rlh_code: '02', rlh_fullcode: '02', rlh_name: 'Site Work', rlh_level: 1, rlh_sortorder: 10 },
  { rlh_costcodeid: 'cc-02-200', rlh_code: '200', rlh_fullcode: '02-200', rlh_name: 'Earthwork', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-02', rlh_sortorder: 20 },
  { rlh_costcodeid: 'cc-01', rlh_code: '210', rlh_fullcode: '02-210', rlh_name: 'Site Preparation', rlh_level: 3, _rlh_parentcostcode_value: 'cc-02-200', _rlh_tradetype_value: 'trade-excavation', rlh_isscope: true, rlh_sortorder: 30 },
  { rlh_costcodeid: 'cc-div-03', rlh_code: '03', rlh_fullcode: '03', rlh_name: 'Concrete', rlh_level: 1, rlh_sortorder: 40 },
  { rlh_costcodeid: 'cc-03-100', rlh_code: '100', rlh_fullcode: '03-100', rlh_name: 'Concrete Forming & Reinforcing', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-03', rlh_sortorder: 50 },
  { rlh_costcodeid: 'cc-02', rlh_code: '110', rlh_fullcode: '03-110', rlh_name: 'Foundation - Footings & Walls', rlh_level: 3, _rlh_parentcostcode_value: 'cc-03-100', _rlh_tradetype_value: 'trade-concrete', rlh_isscope: true, rlh_sortorder: 60 },
  { rlh_costcodeid: 'cc-03-200', rlh_code: '200', rlh_fullcode: '03-200', rlh_name: 'Concrete Flatwork', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-03', rlh_sortorder: 70 },
  { rlh_costcodeid: 'cc-03', rlh_code: '210', rlh_fullcode: '03-210', rlh_name: 'Basement Floor Slab', rlh_level: 3, _rlh_parentcostcode_value: 'cc-03-200', _rlh_tradetype_value: 'trade-concrete', rlh_isscope: true, rlh_sortorder: 80 },
  { rlh_costcodeid: 'cc-div-06', rlh_code: '06', rlh_fullcode: '06', rlh_name: 'Wood & Plastics', rlh_level: 1, rlh_sortorder: 90 },
  { rlh_costcodeid: 'cc-06-100', rlh_code: '100', rlh_fullcode: '06-100', rlh_name: 'Rough Carpentry', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-06', rlh_sortorder: 100 },
  { rlh_costcodeid: 'cc-04', rlh_code: '110', rlh_fullcode: '06-110', rlh_name: 'Rough Framing', rlh_level: 3, _rlh_parentcostcode_value: 'cc-06-100', _rlh_tradetype_value: 'trade-framing', rlh_isscope: true, rlh_sortorder: 110 },
  { rlh_costcodeid: 'cc-06-220', rlh_code: '220', rlh_fullcode: '06-220', rlh_name: 'Finish Carpentry & Millwork', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-06', rlh_sortorder: 120 },
  { rlh_costcodeid: 'cc-17', rlh_code: '221', rlh_fullcode: '06-221', rlh_name: 'Trim & Millwork', rlh_level: 3, _rlh_parentcostcode_value: 'cc-06-220', _rlh_tradetype_value: 'trade-trim', rlh_isscope: true, rlh_sortorder: 130 },
  { rlh_costcodeid: 'cc-06-400', rlh_code: '400', rlh_fullcode: '06-400', rlh_name: 'Cabinets & Casework', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-06', rlh_sortorder: 140 },
  { rlh_costcodeid: 'cc-14', rlh_code: '410', rlh_fullcode: '06-410', rlh_name: 'Cabinets & Casework', rlh_level: 3, _rlh_parentcostcode_value: 'cc-06-400', _rlh_tradetype_value: 'trade-cabinets', rlh_isscope: true, rlh_sortorder: 150 },
  { rlh_costcodeid: 'cc-div-07', rlh_code: '07', rlh_fullcode: '07', rlh_name: 'Thermal & Moisture Protection', rlh_level: 1, rlh_sortorder: 160 },
  { rlh_costcodeid: 'cc-07-200', rlh_code: '200', rlh_fullcode: '07-200', rlh_name: 'Insulation', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-07', rlh_sortorder: 170 },
  { rlh_costcodeid: 'cc-11', rlh_code: '210', rlh_fullcode: '07-210', rlh_name: 'Insulation', rlh_level: 3, _rlh_parentcostcode_value: 'cc-07-200', _rlh_tradetype_value: 'trade-insulation', rlh_isscope: true, rlh_sortorder: 180 },
  { rlh_costcodeid: 'cc-07-310', rlh_code: '310', rlh_fullcode: '07-310', rlh_name: 'Roofing', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-07', rlh_sortorder: 190 },
  { rlh_costcodeid: 'cc-05', rlh_code: '311', rlh_fullcode: '07-311', rlh_name: 'Roofing System', rlh_level: 3, _rlh_parentcostcode_value: 'cc-07-310', _rlh_tradetype_value: 'trade-roofing', rlh_isscope: true, rlh_sortorder: 200 },
  { rlh_costcodeid: 'cc-div-09', rlh_code: '09', rlh_fullcode: '09', rlh_name: 'Finishes', rlh_level: 1, rlh_sortorder: 210 },
  { rlh_costcodeid: 'cc-09-250', rlh_code: '250', rlh_fullcode: '09-250', rlh_name: 'Gypsum Board', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-09', rlh_sortorder: 220 },
  { rlh_costcodeid: 'cc-12', rlh_code: '251', rlh_fullcode: '09-251', rlh_name: 'Drywall', rlh_level: 3, _rlh_parentcostcode_value: 'cc-09-250', _rlh_tradetype_value: 'trade-drywall', rlh_isscope: true, rlh_sortorder: 230 },
  { rlh_costcodeid: 'cc-09-300', rlh_code: '300', rlh_fullcode: '09-300', rlh_name: 'Tile', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-09', rlh_sortorder: 240 },
  { rlh_costcodeid: 'cc-13', rlh_code: '310', rlh_fullcode: '09-310', rlh_name: 'Tile Work', rlh_level: 3, _rlh_parentcostcode_value: 'cc-09-300', _rlh_tradetype_value: 'trade-tile', rlh_isscope: true, rlh_sortorder: 250 },
  { rlh_costcodeid: 'cc-09-900', rlh_code: '900', rlh_fullcode: '09-900', rlh_name: 'Paints & Coatings', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-09', rlh_sortorder: 280 },
  { rlh_costcodeid: 'cc-16', rlh_code: '910', rlh_fullcode: '09-910', rlh_name: 'Paint & Coatings', rlh_level: 3, _rlh_parentcostcode_value: 'cc-09-900', _rlh_tradetype_value: 'trade-paint', rlh_isscope: true, rlh_sortorder: 290 },
  { rlh_costcodeid: 'cc-div-15', rlh_code: '15', rlh_fullcode: '15', rlh_name: 'Mechanical', rlh_level: 1, rlh_sortorder: 300 },
  { rlh_costcodeid: 'cc-15-100', rlh_code: '100', rlh_fullcode: '15-100', rlh_name: 'Plumbing', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-15', rlh_sortorder: 310 },
  { rlh_costcodeid: 'cc-06', rlh_code: '110', rlh_fullcode: '15-110', rlh_name: 'Rough Plumbing', rlh_level: 3, _rlh_parentcostcode_value: 'cc-15-100', _rlh_tradetype_value: 'trade-plumbing', rlh_isscope: true, rlh_sortorder: 320 },
  { rlh_costcodeid: 'cc-07', rlh_code: '200', rlh_fullcode: '15-200', rlh_name: 'Plumbing Fixtures & Trim', rlh_level: 3, _rlh_parentcostcode_value: 'cc-15-100', _rlh_tradetype_value: 'trade-plumbing', rlh_isscope: true, rlh_sortorder: 330 },
  { rlh_costcodeid: 'cc-15-400', rlh_code: '400', rlh_fullcode: '15-400', rlh_name: 'HVAC', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-15', rlh_sortorder: 340 },
  { rlh_costcodeid: 'cc-08', rlh_code: '410', rlh_fullcode: '15-410', rlh_name: 'HVAC System', rlh_level: 3, _rlh_parentcostcode_value: 'cc-15-400', _rlh_tradetype_value: 'trade-hvac', rlh_isscope: true, rlh_sortorder: 350 },
  { rlh_costcodeid: 'cc-div-16', rlh_code: '16', rlh_fullcode: '16', rlh_name: 'Electrical', rlh_level: 1, rlh_sortorder: 360 },
  { rlh_costcodeid: 'cc-16-100', rlh_code: '100', rlh_fullcode: '16-100', rlh_name: 'Electrical Rough-In', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-16', rlh_sortorder: 370 },
  { rlh_costcodeid: 'cc-09', rlh_code: '110', rlh_fullcode: '16-110', rlh_name: 'Rough Electrical', rlh_level: 3, _rlh_parentcostcode_value: 'cc-16-100', _rlh_tradetype_value: 'trade-electrical', rlh_isscope: true, rlh_sortorder: 380 },
  { rlh_costcodeid: 'cc-16-200', rlh_code: '200', rlh_fullcode: '16-200', rlh_name: 'Electrical Fixtures & Devices', rlh_level: 2, _rlh_parentcostcode_value: 'cc-div-16', rlh_sortorder: 390 },
  { rlh_costcodeid: 'cc-10', rlh_code: '210', rlh_fullcode: '16-210', rlh_name: 'Electrical Fixtures & Devices', rlh_level: 3, _rlh_parentcostcode_value: 'cc-16-200', _rlh_tradetype_value: 'trade-electrical', rlh_isscope: true, rlh_sortorder: 400 },
]

export const RAW_COMPANY_TYPES: DvCompanyType[] = [
  { rlh_companytypeid: 'company-type-subcontractor', rlh_name: 'Subcontractor' },
  { rlh_companytypeid: 'company-type-vendor', rlh_name: 'Vendor' },
  { rlh_companytypeid: 'company-type-architect', rlh_name: 'Architect' },
]

export const RAW_COMPANIES: DvCompany[] = [
  { accountid: 'company-001', name: 'Summit Framing Co.', telephone1: '303-555-0112', emailaddress1: 'office@summitframing.example', websiteurl: 'summitframing.example', address1_composite: '1840 W 44th Ave, Denver, CO', createdon: '2026-01-05T16:00:00Z' },
  { accountid: 'company-002', name: 'Highline Roofing', telephone1: '303-555-0118', emailaddress1: 'estimating@highlineroofing.example', websiteurl: 'highlineroofing.example', address1_composite: '9200 Brighton Rd, Commerce City, CO', createdon: '2026-01-06T16:00:00Z' },
  { accountid: 'company-003', name: 'Copper State Plumbing', telephone1: '303-555-0130', emailaddress1: 'pm@copperstate.example', websiteurl: 'copperstate.example', address1_composite: '510 Osage St, Denver, CO', createdon: '2026-01-07T16:00:00Z' },
  { accountid: 'company-004', name: 'Peak Climate Mechanical', telephone1: '303-555-0141', emailaddress1: 'ops@peakclimate.example', websiteurl: 'peakclimate.example', address1_composite: '6655 York St, Denver, CO', createdon: '2026-01-08T16:00:00Z' },
  { accountid: 'company-005', name: 'Front Range Electric', telephone1: '303-555-0152', emailaddress1: 'precon@frontrangeelectric.example', websiteurl: 'frontrangeelectric.example', address1_composite: '1420 S Lipan St, Denver, CO', createdon: '2026-01-09T16:00:00Z' },
  { accountid: 'company-006', name: 'Alpine Cabinetry', telephone1: '303-555-0161', emailaddress1: 'sales@alpinecabinetry.example', websiteurl: 'alpinecabinetry.example', address1_composite: '800 Buckley Rd, Aurora, CO', createdon: '2026-01-10T16:00:00Z' },
  { accountid: 'company-007', name: 'Studio Terrain Architecture', telephone1: '303-555-0174', emailaddress1: 'team@studioterrain.example', websiteurl: 'studioterrain.example', address1_composite: '3140 Blake St, Denver, CO', createdon: '2026-01-11T16:00:00Z' },
  { accountid: 'company-008', name: 'Mountain Tile Gallery', telephone1: '303-555-0188', emailaddress1: 'design@mountaintile.example', websiteurl: 'mountaintile.example', address1_composite: '1201 S Santa Fe Dr, Denver, CO', createdon: '2026-01-12T16:00:00Z' },
  { accountid: 'company-009', name: 'Timberline Millwork', telephone1: '303-555-0190', emailaddress1: 'estimating@timberline.example', websiteurl: 'timberlinemillwork.example', address1_composite: '7710 Dahlia St, Commerce City, CO', createdon: '2026-01-13T16:00:00Z' },
  { accountid: 'company-010', name: 'Red Earth Civil', telephone1: '303-555-0199', emailaddress1: 'office@redearthcivil.example', websiteurl: 'redearthcivil.example', address1_composite: '10400 Havana St, Henderson, CO', createdon: '2026-01-14T16:00:00Z' },
  { accountid: 'company-011', name: 'Cornerstone Concrete', telephone1: '303-555-0204', emailaddress1: 'precon@cornerstoneconcrete.example', websiteurl: 'cornerstoneconcrete.example', address1_composite: '4550 York St, Denver, CO', createdon: '2026-01-15T16:00:00Z' },
]

export const RAW_COMPANY_COMPANY_TYPES: DvCompanyCompanyType[] = [
  { rlh_company_companytypeid: 'company-companytype-001', _rlh_company_value: 'company-001', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-002', _rlh_company_value: 'company-002', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-003', _rlh_company_value: 'company-003', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-004', _rlh_company_value: 'company-004', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-005', _rlh_company_value: 'company-005', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-006', _rlh_company_value: 'company-006', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-007', _rlh_company_value: 'company-007', _rlh_companytype_value: 'company-type-architect' },
  { rlh_company_companytypeid: 'company-companytype-008', _rlh_company_value: 'company-008', _rlh_companytype_value: 'company-type-vendor' },
  { rlh_company_companytypeid: 'company-companytype-009', _rlh_company_value: 'company-009', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-010', _rlh_company_value: 'company-010', _rlh_companytype_value: 'company-type-subcontractor' },
  { rlh_company_companytypeid: 'company-companytype-011', _rlh_company_value: 'company-011', _rlh_companytype_value: 'company-type-subcontractor' },
]

export const RAW_COMPANY_TRADE_TYPES: DvCompanyTradeType[] = [
  { rlh_company_tradetypeid: 'company-trade-001', _rlh_company_value: 'company-001', _rlh_tradetype_value: 'trade-framing' },
  { rlh_company_tradetypeid: 'company-trade-002', _rlh_company_value: 'company-002', _rlh_tradetype_value: 'trade-roofing' },
  { rlh_company_tradetypeid: 'company-trade-003', _rlh_company_value: 'company-003', _rlh_tradetype_value: 'trade-plumbing' },
  { rlh_company_tradetypeid: 'company-trade-004', _rlh_company_value: 'company-004', _rlh_tradetype_value: 'trade-hvac' },
  { rlh_company_tradetypeid: 'company-trade-005', _rlh_company_value: 'company-005', _rlh_tradetype_value: 'trade-electrical' },
  { rlh_company_tradetypeid: 'company-trade-006', _rlh_company_value: 'company-006', _rlh_tradetype_value: 'trade-cabinets' },
  { rlh_company_tradetypeid: 'company-trade-007', _rlh_company_value: 'company-008', _rlh_tradetype_value: 'trade-tile' },
  { rlh_company_tradetypeid: 'company-trade-008', _rlh_company_value: 'company-009', _rlh_tradetype_value: 'trade-cabinets' },
  { rlh_company_tradetypeid: 'company-trade-009', _rlh_company_value: 'company-010', _rlh_tradetype_value: 'trade-excavation' },
  { rlh_company_tradetypeid: 'company-trade-010', _rlh_company_value: 'company-011', _rlh_tradetype_value: 'trade-concrete' },
]

export const RAW_CAPABILITIES: DvCapability[] = [
  { rlh_capabilityid: 'cap-001', rlh_name: 'Panelized Framing', rlh_description: 'Efficient rough framing using pre-cut packages.', _rlh_tradetype_value: 'trade-framing' },
  { rlh_capabilityid: 'cap-002', rlh_name: 'Standing Seam Roofing', rlh_description: 'Premium architectural metal roofing systems.', _rlh_tradetype_value: 'trade-roofing' },
  { rlh_capabilityid: 'cap-003', rlh_name: 'Hydronic Heat', rlh_description: 'Hydronic radiant floor heating and controls.', _rlh_tradetype_value: 'trade-hvac' },
  { rlh_capabilityid: 'cap-004', rlh_name: 'Lighting Controls', rlh_description: 'Low-voltage lighting controls and programming.', _rlh_tradetype_value: 'trade-electrical' },
  { rlh_capabilityid: 'cap-005', rlh_name: 'Custom Casework', rlh_description: 'Custom fabricated cabinetry and built-ins.', _rlh_tradetype_value: 'trade-cabinets' },
]

export const RAW_COMPANY_CAPABILITIES: DvCompanyCapability[] = [
  { rlh_company_capabilityid: 'company-cap-001', _rlh_company_value: 'company-001', _rlh_capability_value: 'cap-001', rlh_rating: 936880003 },
  { rlh_company_capabilityid: 'company-cap-002', _rlh_company_value: 'company-002', _rlh_capability_value: 'cap-002', rlh_rating: 936880003 },
  { rlh_company_capabilityid: 'company-cap-003', _rlh_company_value: 'company-004', _rlh_capability_value: 'cap-003', rlh_rating: 936880004 },
  { rlh_company_capabilityid: 'company-cap-004', _rlh_company_value: 'company-005', _rlh_capability_value: 'cap-004', rlh_rating: 936880003 },
  { rlh_company_capabilityid: 'company-cap-005', _rlh_company_value: 'company-006', _rlh_capability_value: 'cap-005', rlh_rating: 936880004 },
  { rlh_company_capabilityid: 'company-cap-006', _rlh_company_value: 'company-009', _rlh_capability_value: 'cap-005', rlh_rating: 936880002 },
]

export const RAW_CONTACT_ROLES: DvContactRole[] = [
  { rlh_contactroleid: 'contact-role-001', rlh_name: 'Principal' },
  { rlh_contactroleid: 'contact-role-002', rlh_name: 'Project Manager' },
  { rlh_contactroleid: 'contact-role-003', rlh_name: 'Estimator' },
  { rlh_contactroleid: 'contact-role-004', rlh_name: 'Superintendent' },
]

export const RAW_CONTACTS: DvContact[] = [
  { contactid: 'contact-001', firstname: 'Hank', lastname: 'Bennett', fullname: 'Hank Bennett', emailaddress1: 'hank@summitframing.example', mobilephone: '303-555-1001', jobtitle: 'Project Manager', _parentcustomerid_value: 'company-001', createdon: '2026-01-08T18:00:00Z' },
  { contactid: 'contact-002', firstname: 'Lydia', lastname: 'Mills', fullname: 'Lydia Mills', emailaddress1: 'lydia@highlineroofing.example', mobilephone: '303-555-1002', jobtitle: 'Estimator', _parentcustomerid_value: 'company-002', createdon: '2026-01-08T18:10:00Z' },
  { contactid: 'contact-003', firstname: 'Marco', lastname: 'Ruiz', fullname: 'Marco Ruiz', emailaddress1: 'marco@copperstate.example', mobilephone: '303-555-1003', jobtitle: 'Project Manager', _parentcustomerid_value: 'company-003', createdon: '2026-01-08T18:20:00Z' },
  { contactid: 'contact-004', firstname: 'Jess', lastname: 'Larkin', fullname: 'Jess Larkin', emailaddress1: 'jess@peakclimate.example', mobilephone: '303-555-1004', jobtitle: 'Operations Lead', _parentcustomerid_value: 'company-004', createdon: '2026-01-08T18:30:00Z' },
  { contactid: 'contact-005', firstname: 'Nina', lastname: 'Cole', fullname: 'Nina Cole', emailaddress1: 'nina@frontrangeelectric.example', mobilephone: '303-555-1005', jobtitle: 'Preconstruction Manager', _parentcustomerid_value: 'company-005', createdon: '2026-01-08T18:40:00Z' },
  { contactid: 'contact-006', firstname: 'Oscar', lastname: 'Vale', fullname: 'Oscar Vale', emailaddress1: 'oscar@alpinecabinetry.example', mobilephone: '303-555-1006', jobtitle: 'Principal', _parentcustomerid_value: 'company-006', createdon: '2026-01-08T18:50:00Z' },
  { contactid: 'contact-007', firstname: 'Avery', lastname: 'Cross', fullname: 'Avery Cross', emailaddress1: 'avery@studioterrain.example', mobilephone: '303-555-1007', jobtitle: 'Architect', _parentcustomerid_value: 'company-007', createdon: '2026-01-08T19:00:00Z' },
  { contactid: 'contact-008', firstname: 'Peyton', lastname: 'Shaw', fullname: 'Peyton Shaw', emailaddress1: 'peyton@redearthcivil.example', mobilephone: '303-555-1008', jobtitle: 'Superintendent', _parentcustomerid_value: 'company-010', createdon: '2026-01-08T19:10:00Z' },
  { contactid: 'contact-009', firstname: 'Grant', lastname: 'Fowler', fullname: 'Grant Fowler', emailaddress1: 'grant@cornerstoneconcrete.example', mobilephone: '303-555-1009', jobtitle: 'Project Manager', _parentcustomerid_value: 'company-011', createdon: '2026-01-08T19:20:00Z' },
]

export const RAW_CLIENTS: DvClient[] = [
  { rlh_clientid: PRIMARY_CLIENT_ID, rlh_name: 'Jane & Mark Whitaker', rlh_email: 'whitakers@example.com', rlh_phone: '720-555-4401', rlh_status: 936880004, rlh_projectaddress: '1450 S Franklin St, Denver, CO', rlh_projectdescription: 'Whole-home renovation with kitchen rework, primary suite refresh, and upgraded systems.', rlh_source: 'Referral', createdon: '2026-01-03T16:00:00Z', modifiedon: '2026-02-15T17:00:00Z' },
  { rlh_clientid: 'client-002', rlh_firstname: 'Elena', rlh_lastname: 'Brooks', rlh_email: 'elena.brooks@example.com', rlh_phone: '720-555-4402', rlh_status: 936880001, rlh_projectaddress: '3120 Stuart St, Denver, CO', rlh_projectdescription: 'Main-floor addition feasibility and outdoor connection.', rlh_source: 'Website', createdon: '2026-03-05T15:00:00Z', modifiedon: '2026-03-10T17:00:00Z' },
  { rlh_clientid: 'client-003', rlh_name: 'Sam and Nora Patel', rlh_email: 'patels@example.com', rlh_phone: '720-555-4403', rlh_status: 936880002, rlh_projectaddress: '9985 E 8th Ave, Denver, CO', rlh_projectdescription: 'Basement finish with guest suite and media room.', rlh_source: 'Instagram', createdon: '2026-03-11T15:00:00Z', modifiedon: '2026-03-19T17:00:00Z' },
  { rlh_clientid: 'client-004', rlh_firstname: 'Chris', rlh_lastname: 'Holloway', rlh_email: 'chris.holloway@example.com', rlh_phone: '720-555-4404', rlh_status: 936880003, rlh_projectaddress: '440 Albion St, Denver, CO', rlh_projectdescription: 'Interior refresh and garage conversion.', rlh_source: 'Past Client', createdon: '2026-03-15T15:00:00Z', modifiedon: '2026-03-28T17:00:00Z' },
  { rlh_clientid: 'client-005', rlh_firstname: 'Mia', rlh_lastname: 'Jensen', rlh_email: 'mia.jensen@example.com', rlh_phone: '720-555-4405', rlh_status: 936880000, rlh_projectaddress: '1888 S Jackson St, Denver, CO', rlh_projectdescription: 'Kitchen remodel and mudroom storage upgrades.', rlh_source: 'Yard Sign', createdon: '2026-03-25T15:00:00Z', modifiedon: '2026-03-25T15:00:00Z' },
]

export const RAW_PROJECTS: DvProject[] = [
  {
    cr6cd_projectid: PRIMARY_PROJECT_ID,
    cr6cd_projectname: 'Whitaker Residence Renovation',
    rlh_address: '1450 S Franklin St, Denver, CO',
    cr6cd_startdate: '2026-03-02',
    cr6cd_enddate: '2026-08-28',
    rlh_status: 936880001,
    _rlh_client_value: PRIMARY_CLIENT_ID,
    rlh_sharepointsiteurl: 'https://rangeline.sharepoint.com/sites/WhitakerResidence',
    rlh_sharepointsiteid: 'site-whitaker-001',
    createdon: '2026-02-12T16:00:00Z',
    modifiedon: '2026-03-20T18:00:00Z',
  },
]

export const RAW_PROJECT_CONTACTS: DvProjectContact[] = [
  { rlh_projectcontactid: 'project-contact-001', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_contact_value: 'contact-007', _rlh_contactrole_value: 'contact-role-001' },
  { rlh_projectcontactid: 'project-contact-002', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_contact_value: 'contact-003', _rlh_contactrole_value: 'contact-role-002' },
  { rlh_projectcontactid: 'project-contact-003', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_contact_value: 'contact-005', _rlh_contactrole_value: 'contact-role-003' },
]

export const RAW_SPACES: DvSpace[] = [
  { rlh_spaceid: 'space-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Kitchen', rlh_level: 'Main Level', rlh_sortorder: 10 },
  { rlh_spaceid: 'space-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Great Room', rlh_level: 'Main Level', rlh_sortorder: 20 },
  { rlh_spaceid: 'space-003', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Primary Bath', rlh_level: 'Second Level', rlh_sortorder: 30 },
  { rlh_spaceid: 'space-004', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Mudroom', rlh_level: 'Main Level', rlh_sortorder: 40 },
]

export const RAW_SCOPE_DETAILS: DvScopeDetail[] = [
  { rlh_scopedetailid: 'scope-detail-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_content: 'Kitchen perimeter cabinetry with painted shaker fronts and a walnut island.', rlh_detailtype: 936880000, rlh_speccode: 'CA-1', _rlh_space_value: 'space-001', _rlh_tradetype_value: 'trade-cabinets', _rlh_costcode_value: 'cc-14', createdon: '2026-02-18T17:00:00Z' },
  { rlh_scopedetailid: 'scope-detail-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_content: 'Primary bath shower walls tile full height with large-format porcelain.', rlh_detailtype: 936880000, rlh_speccode: 'TL-2', _rlh_space_value: 'space-003', _rlh_tradetype_value: 'trade-tile', _rlh_costcode_value: 'cc-13', createdon: '2026-02-19T17:00:00Z' },
  { rlh_scopedetailid: 'scope-detail-003', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_content: 'Lighting controls include dimmable keypads at the kitchen, great room, and primary suite.', rlh_detailtype: 936880001, rlh_speccode: 'EL-4', _rlh_space_value: 'space-002', _rlh_tradetype_value: 'trade-electrical', _rlh_costcode_value: 'cc-10', createdon: '2026-02-20T17:00:00Z' },
  { rlh_scopedetailid: 'scope-detail-004', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_content: 'Hydronic radiant heat is required at the primary bath and great room.', rlh_detailtype: 936880001, rlh_speccode: 'ME-3', _rlh_space_value: 'space-003', _rlh_tradetype_value: 'trade-hvac', _rlh_costcode_value: 'cc-08', createdon: '2026-02-21T17:00:00Z' },
  { rlh_scopedetailid: 'scope-detail-005', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_content: 'Level 5 drywall finish is required in all public-facing main level spaces.', rlh_detailtype: 936880002, rlh_speccode: 'PT-1', _rlh_space_value: 'space-002', _rlh_tradetype_value: 'trade-paint', _rlh_costcode_value: 'cc-16', createdon: '2026-02-22T17:00:00Z' },
]

export const RAW_SCOPE_ITEMS: DvScopeItem[] = [
  { rlh_scopeitemid: 'scope-item-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Kitchen cabinetry and walnut island', rlh_description: 'Finalize field dimensions, appliance clearances, and custom cabinetry package for the remodeled kitchen.', _rlh_tradetype_value: 'trade-cabinets', _rlh_costcode_value: 'cc-14', rlh_notes: 'Coordinate with electrical for under-cabinet lighting and outlets.', rlh_sortorder: 10, createdon: '2026-02-24T17:00:00Z', modifiedon: '2026-03-06T17:00:00Z' },
  { rlh_scopeitemid: 'scope-item-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Primary bath shower tile package', rlh_description: 'Carry shower walls, niche layout, waterproofing details, and trim coordination through bid and install.', _rlh_tradetype_value: 'trade-tile', _rlh_costcode_value: 'cc-13', rlh_notes: 'Pending final material selection from client.', rlh_sortorder: 20, createdon: '2026-02-24T18:00:00Z', modifiedon: '2026-03-04T17:00:00Z' },
  { rlh_scopeitemid: 'scope-item-003', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Lighting controls and trim devices', rlh_description: 'Include keypad rough-in, dimming zones, and final trim device package for the main living areas.', _rlh_tradetype_value: 'trade-electrical', _rlh_costcode_value: 'cc-10', rlh_notes: 'Needs integration call with AV consultant before final release.', rlh_sortorder: 30, createdon: '2026-02-25T17:00:00Z', modifiedon: '2026-03-12T17:00:00Z' },
  { rlh_scopeitemid: 'scope-item-004', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Hydronic radiant heat distribution', rlh_description: 'Coordinate manifolds, thermostat zones, tubing layout, and insulation package for radiant floor heat.', _rlh_tradetype_value: 'trade-hvac', _rlh_costcode_value: 'cc-08', rlh_notes: 'Builder wants manifold location resolved before framing wrap-up.', rlh_sortorder: 40, createdon: '2026-02-25T18:00:00Z', modifiedon: '2026-03-14T17:00:00Z' },
  { rlh_scopeitemid: 'scope-item-005', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Level 5 finish and final paint sequence', rlh_description: 'Carry drywall finish expectations, primer schedule, and final paint protection through close-in and finishes.', _rlh_tradetype_value: 'trade-paint', _rlh_costcode_value: 'cc-16', rlh_notes: 'Sequence depends on cabinetry install and floor protection plan.', rlh_sortorder: 50, createdon: '2026-02-26T17:00:00Z', modifiedon: '2026-03-15T17:00:00Z' },
]

export const RAW_SCOPE_ITEM_SCOPE_DETAILS: DvScopeItemScopeDetail[] = [
  { rlh_scopeitem_scopedetailid: 'scope-item-detail-link-001', _rlh_scopeitem_value: 'scope-item-001', _rlh_scopedetail_value: 'scope-detail-001' },
  { rlh_scopeitem_scopedetailid: 'scope-item-detail-link-002', _rlh_scopeitem_value: 'scope-item-002', _rlh_scopedetail_value: 'scope-detail-002' },
  { rlh_scopeitem_scopedetailid: 'scope-item-detail-link-003', _rlh_scopeitem_value: 'scope-item-003', _rlh_scopedetail_value: 'scope-detail-003' },
  { rlh_scopeitem_scopedetailid: 'scope-item-detail-link-004', _rlh_scopeitem_value: 'scope-item-004', _rlh_scopedetail_value: 'scope-detail-004' },
  { rlh_scopeitem_scopedetailid: 'scope-item-detail-link-005', _rlh_scopeitem_value: 'scope-item-005', _rlh_scopedetail_value: 'scope-detail-005' },
]

export const RAW_SCOPE_ITEM_SPACES: DvScopeItemSpace[] = [
  { rlh_scopeitem_spaceid: 'scope-item-space-link-001', _rlh_scopeitem_value: 'scope-item-001', _rlh_space_value: 'space-001' },
  { rlh_scopeitem_spaceid: 'scope-item-space-link-002', _rlh_scopeitem_value: 'scope-item-002', _rlh_space_value: 'space-003' },
  { rlh_scopeitem_spaceid: 'scope-item-space-link-003', _rlh_scopeitem_value: 'scope-item-003', _rlh_space_value: 'space-001' },
  { rlh_scopeitem_spaceid: 'scope-item-space-link-004', _rlh_scopeitem_value: 'scope-item-003', _rlh_space_value: 'space-002' },
  { rlh_scopeitem_spaceid: 'scope-item-space-link-005', _rlh_scopeitem_value: 'scope-item-004', _rlh_space_value: 'space-002' },
  { rlh_scopeitem_spaceid: 'scope-item-space-link-006', _rlh_scopeitem_value: 'scope-item-004', _rlh_space_value: 'space-003' },
  { rlh_scopeitem_spaceid: 'scope-item-space-link-007', _rlh_scopeitem_value: 'scope-item-005', _rlh_space_value: 'space-002' },
]

export const RAW_COST_ITEMS: DvCostItem[] = [
  { rlh_costitemid: 'cost-item-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Kitchen cabinetry package', rlh_description: 'Custom cabinetry, walnut island, site finish carpentry, and hardware coordination.', rlh_status: 936880002, rlh_source: 936880001, rlh_estimatelow: 28000, rlh_estimatehigh: 34000, _rlh_tradetype_value: 'trade-cabinets', _rlh_costcode_value: 'cc-14', rlh_notes: 'Awaiting final appliance specs before release.', rlh_sortorder: 10, createdon: '2026-02-27T17:00:00Z', modifiedon: '2026-03-18T17:00:00Z' },
  { rlh_costitemid: 'cost-item-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Primary bath tile and waterproofing', rlh_description: 'Tile install, waterproofing system, trims, and setting materials.', rlh_status: 936880001, rlh_source: 936880001, rlh_estimatelow: 11800, rlh_estimatehigh: 14600, _rlh_tradetype_value: 'trade-tile', _rlh_costcode_value: 'cc-13', rlh_notes: 'Selection still open on finish tile.', rlh_sortorder: 20, createdon: '2026-02-27T18:00:00Z', modifiedon: '2026-03-10T17:00:00Z' },
  { rlh_costitemid: 'cost-item-003', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Lighting controls and trim devices', rlh_description: 'Keypads, dimmers, final devices, and commissioning for scene control.', rlh_status: 936880002, rlh_source: 936880001, rlh_estimatelow: 9400, rlh_estimatehigh: 12100, _rlh_tradetype_value: 'trade-electrical', _rlh_costcode_value: 'cc-10', rlh_notes: 'Coordinate keypad counts with AV package.', rlh_sortorder: 30, createdon: '2026-02-27T19:00:00Z', modifiedon: '2026-03-16T17:00:00Z' },
  { rlh_costitemid: 'cost-item-004', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Hydronic radiant heat scope', rlh_description: 'Radiant tubing, manifolds, controls, balancing, and startup.', rlh_status: 936880002, rlh_source: 936880001, rlh_estimatelow: 16500, rlh_estimatehigh: 19800, _rlh_tradetype_value: 'trade-hvac', _rlh_costcode_value: 'cc-08', rlh_notes: 'Potential added insulation scope pending slab edge review.', rlh_sortorder: 40, createdon: '2026-02-28T17:00:00Z', modifiedon: '2026-03-17T17:00:00Z' },
  { rlh_costitemid: 'cost-item-005', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Plumbing fixtures and trim', rlh_description: 'Primary bath fixture set, trim kits, valves, and final install labor.', rlh_status: 936880003, rlh_source: 936880001, rlh_estimatelow: 8900, rlh_estimatehigh: 9800, rlh_awardedamount: 9200, _rlh_tradetype_value: 'trade-plumbing', _rlh_costcode_value: 'cc-07', _rlh_bidpackage_value: 'bid-package-003', rlh_notes: 'Awarded contingent on long-lead valve release.', rlh_sortorder: 50, createdon: '2026-02-28T18:00:00Z', modifiedon: '2026-03-22T17:00:00Z' },
  { rlh_costitemid: 'cost-item-006', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Level 5 finish and final paint', rlh_description: 'Skim coat where required, premium primer, and full final paint scope.', rlh_status: 936880001, rlh_source: 936880000, rlh_estimatelow: 13200, rlh_estimatehigh: 15800, _rlh_tradetype_value: 'trade-paint', _rlh_costcode_value: 'cc-16', rlh_notes: 'Budget carry only until drywall scope is finalized.', rlh_sortorder: 60, createdon: '2026-02-28T19:00:00Z', modifiedon: '2026-03-09T17:00:00Z' },
]

export const RAW_COST_ITEM_SCOPE_ITEMS: DvCostItemScopeItem[] = [
  { rlh_costitem_scopeitemid: 'cost-item-scope-link-001', _rlh_costitem_value: 'cost-item-001', _rlh_scopeitem_value: 'scope-item-001' },
  { rlh_costitem_scopeitemid: 'cost-item-scope-link-002', _rlh_costitem_value: 'cost-item-002', _rlh_scopeitem_value: 'scope-item-002' },
  { rlh_costitem_scopeitemid: 'cost-item-scope-link-003', _rlh_costitem_value: 'cost-item-003', _rlh_scopeitem_value: 'scope-item-003' },
  { rlh_costitem_scopeitemid: 'cost-item-scope-link-004', _rlh_costitem_value: 'cost-item-004', _rlh_scopeitem_value: 'scope-item-004' },
  { rlh_costitem_scopeitemid: 'cost-item-scope-link-005', _rlh_costitem_value: 'cost-item-005', _rlh_scopeitem_value: 'scope-item-002' },
  { rlh_costitem_scopeitemid: 'cost-item-scope-link-006', _rlh_costitem_value: 'cost-item-006', _rlh_scopeitem_value: 'scope-item-005' },
]

export const RAW_COST_ITEM_SPACES: DvCostItemSpace[] = [
  { rlh_costitem_spaceid: 'cost-item-space-link-001', _rlh_costitem_value: 'cost-item-001', _rlh_space_value: 'space-001' },
  { rlh_costitem_spaceid: 'cost-item-space-link-002', _rlh_costitem_value: 'cost-item-002', _rlh_space_value: 'space-003' },
  { rlh_costitem_spaceid: 'cost-item-space-link-003', _rlh_costitem_value: 'cost-item-003', _rlh_space_value: 'space-001' },
  { rlh_costitem_spaceid: 'cost-item-space-link-004', _rlh_costitem_value: 'cost-item-003', _rlh_space_value: 'space-002' },
  { rlh_costitem_spaceid: 'cost-item-space-link-005', _rlh_costitem_value: 'cost-item-004', _rlh_space_value: 'space-002' },
  { rlh_costitem_spaceid: 'cost-item-space-link-006', _rlh_costitem_value: 'cost-item-004', _rlh_space_value: 'space-003' },
  { rlh_costitem_spaceid: 'cost-item-space-link-007', _rlh_costitem_value: 'cost-item-005', _rlh_space_value: 'space-003' },
  { rlh_costitem_spaceid: 'cost-item-space-link-008', _rlh_costitem_value: 'cost-item-006', _rlh_space_value: 'space-002' },
]

export const RAW_SELECTIONS: DvSelection[] = [
  { rlh_selectionid: 'selection-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Primary bath wall tile', rlh_category: 'Tile', rlh_description: 'Client-facing tile selection for primary shower walls.', rlh_status: 936880001, rlh_procurementresponsibility: 936880000, rlh_manufacturer: 'Fireclay', rlh_modelnumber: 'FCL-PORC-12X24', rlh_finish: 'Matte', rlh_color: 'Warm White', rlh_quantity: 180, rlh_unit: 'SF', rlh_totalcost: 5400, _rlh_tradetype_value: 'trade-tile', _rlh_supplier_value: 'company-008', rlh_notes: 'Sample board approved pending grout color.', createdon: '2026-03-01T17:00:00Z', modifiedon: '2026-03-05T17:00:00Z' },
  { rlh_selectionid: 'selection-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Primary bath plumbing trim', rlh_category: 'Fixture', rlh_description: 'Trim package for shower, tub filler, and lavatory faucets.', rlh_status: 936880002, rlh_procurementresponsibility: 936880001, rlh_manufacturer: 'Brizo', rlh_modelnumber: 'LITZE', rlh_finish: 'Brushed Nickel', rlh_quantity: 1, rlh_unit: 'LS', rlh_totalcost: 4200, _rlh_tradetype_value: 'trade-plumbing', _rlh_supplier_value: 'company-003', rlh_notes: 'Release with rough plumbing confirmation.', createdon: '2026-03-02T17:00:00Z', modifiedon: '2026-03-08T17:00:00Z' },
]

export const RAW_SELECTION_COST_ITEMS: DvSelectionCostItem[] = [
  { rlh_selection_costitemid: 'selection-cost-link-001', _rlh_selection_value: 'selection-001', _rlh_costitem_value: 'cost-item-002' },
  { rlh_selection_costitemid: 'selection-cost-link-002', _rlh_selection_value: 'selection-002', _rlh_costitem_value: 'cost-item-005' },
]

export const RAW_SELECTION_SPACES: DvSelectionSpace[] = [
  { rlh_selection_spaceid: 'selection-space-link-001', _rlh_selection_value: 'selection-001', _rlh_space_value: 'space-003' },
  { rlh_selection_spaceid: 'selection-space-link-002', _rlh_selection_value: 'selection-002', _rlh_space_value: 'space-003' },
]

export const RAW_BID_PACKAGES: DvBidPackage[] = [
  { rlh_bidpackageid: 'bid-package-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Cabinetry Bid Package', rlh_status: 936880002, _rlh_tradetype_value: 'trade-cabinets', rlh_description: 'Custom kitchen cabinetry, island fabrication, field verification, and install.', rlh_duedate: '2026-04-10', rlh_sentdate: '2026-03-28', rlh_notes: 'Reviewing alternates for walnut veneer match.', createdon: '2026-03-18T17:00:00Z', modifiedon: '2026-03-29T17:00:00Z' },
  { rlh_bidpackageid: 'bid-package-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Mechanical Hydronic Package', rlh_status: 936880001, _rlh_tradetype_value: 'trade-hvac', rlh_description: 'Radiant tubing, manifolds, balancing, controls, and startup.', rlh_duedate: '2026-04-08', rlh_sentdate: '2026-03-27', rlh_notes: 'Need insulation assumptions confirmed.', createdon: '2026-03-17T17:00:00Z', modifiedon: '2026-03-27T17:00:00Z' },
  { rlh_bidpackageid: 'bid-package-003', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Primary Bath Plumbing Fixtures', rlh_status: 936880003, _rlh_tradetype_value: 'trade-plumbing', rlh_description: 'Fixture trims, valves, and final install for primary bath plumbing package.', rlh_duedate: '2026-03-20', rlh_sentdate: '2026-03-10', rlh_awardeddate: '2026-03-24', _rlh_awardedcompany_value: 'company-003', rlh_notes: 'Awarded to current rough plumbing trade partner.', createdon: '2026-03-08T17:00:00Z', modifiedon: '2026-03-24T17:00:00Z' },
  { rlh_bidpackageid: 'bid-package-004', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_name: 'Lighting Controls Package', rlh_status: 936880002, _rlh_tradetype_value: 'trade-electrical', rlh_description: 'Keypads, dimming controls, trim devices, and programming labor.', rlh_duedate: '2026-04-12', rlh_sentdate: '2026-03-29', rlh_notes: 'Waiting on final scene list from design team.', createdon: '2026-03-20T17:00:00Z', modifiedon: '2026-03-29T17:00:00Z' },
]

export const RAW_BID_PACKAGE_COST_ITEMS: DvBidPackageCostItem[] = [
  { rlh_bidpackage_costitemid: 'bidpackage-costitem-link-001', _rlh_bidpackage_value: 'bid-package-001', _rlh_costitem_value: 'cost-item-001' },
  { rlh_bidpackage_costitemid: 'bidpackage-costitem-link-002', _rlh_bidpackage_value: 'bid-package-002', _rlh_costitem_value: 'cost-item-004' },
  { rlh_bidpackage_costitemid: 'bidpackage-costitem-link-003', _rlh_bidpackage_value: 'bid-package-003', _rlh_costitem_value: 'cost-item-005' },
  { rlh_bidpackage_costitemid: 'bidpackage-costitem-link-004', _rlh_bidpackage_value: 'bid-package-004', _rlh_costitem_value: 'cost-item-003' },
]

export const RAW_BID_PACKAGE_SCOPE_ITEMS: DvBidPackageScopeItem[] = [
  { rlh_bidpackage_scopeitemid: 'bidpackage-scope-link-001', _rlh_bidpackage_value: 'bid-package-001', _rlh_scopeitem_value: 'scope-item-001' },
  { rlh_bidpackage_scopeitemid: 'bidpackage-scope-link-002', _rlh_bidpackage_value: 'bid-package-002', _rlh_scopeitem_value: 'scope-item-004' },
  { rlh_bidpackage_scopeitemid: 'bidpackage-scope-link-003', _rlh_bidpackage_value: 'bid-package-003', _rlh_scopeitem_value: 'scope-item-002' },
  { rlh_bidpackage_scopeitemid: 'bidpackage-scope-link-004', _rlh_bidpackage_value: 'bid-package-004', _rlh_scopeitem_value: 'scope-item-003' },
]

export const RAW_QUOTES: DvQuote[] = [
  { rlh_quoteid: 'quote-001', _rlh_bidpackage_value: 'bid-package-001', _rlh_company_value: 'company-006', rlh_totalamount: 31500, rlh_status: 936880000, rlh_submitteddate: '2026-04-01', rlh_validuntil: '2026-04-30', rlh_notes: 'Base package includes walnut island veneer.', createdon: '2026-04-01T17:00:00Z' },
  { rlh_quoteid: 'quote-002', _rlh_bidpackage_value: 'bid-package-001', _rlh_company_value: 'company-009', rlh_totalamount: 29850, rlh_status: 936880002, rlh_submitteddate: '2026-04-02', rlh_validuntil: '2026-04-25', rlh_notes: 'Rejected due to schedule concerns.', createdon: '2026-04-02T17:00:00Z' },
  { rlh_quoteid: 'quote-003', _rlh_bidpackage_value: 'bid-package-002', _rlh_company_value: 'company-004', rlh_totalamount: 18400, rlh_status: 936880000, rlh_submitteddate: '2026-04-03', rlh_validuntil: '2026-05-01', rlh_notes: 'Includes controls startup and balancing.', createdon: '2026-04-03T17:00:00Z' },
  { rlh_quoteid: 'quote-004', _rlh_bidpackage_value: 'bid-package-003', _rlh_company_value: 'company-003', rlh_totalamount: 9200, rlh_status: 936880001, rlh_submitteddate: '2026-03-18', rlh_validuntil: '2026-04-05', rlh_notes: 'Accepted on 2026-03-24.', createdon: '2026-03-18T17:00:00Z' },
  { rlh_quoteid: 'quote-005', _rlh_bidpackage_value: 'bid-package-004', _rlh_company_value: 'company-005', rlh_totalamount: 10850, rlh_status: 936880000, rlh_submitteddate: '2026-04-04', rlh_validuntil: '2026-04-28', rlh_notes: 'Programming allowance included.', createdon: '2026-04-04T17:00:00Z' },
]

export const RAW_GATES: DvBuildPhase[] = [
  { cr6cd_buildphaseid: 'gate-proj-001-1', cr6cd_name: 'Gate 1', cr6cd_sortorder: 1, cr6cd_description: 'Site work, excavation, foundation, and underground systems. Slab poured and cured.', rlh_lockstatus: 936880000, rlh_workingwindowstart: '2026-03-02', rlh_workingwindowend: '2026-03-20', _cr6cd_projectid_value: PRIMARY_PROJECT_ID },
  { cr6cd_buildphaseid: 'gate-proj-001-2', cr6cd_name: 'Gate 2', cr6cd_sortorder: 2, cr6cd_description: 'Structure complete. Framing, roof sheathing, structural inspections passed.', rlh_lockstatus: 936880000, rlh_workingwindowstart: '2026-03-23', rlh_workingwindowend: '2026-04-17', _cr6cd_projectid_value: PRIMARY_PROJECT_ID },
  { cr6cd_buildphaseid: 'gate-proj-001-3', cr6cd_name: 'Gate 3', cr6cd_sortorder: 3, cr6cd_description: 'Enclosure and systems. Building weather-tight. Rough MEP complete and inspected.', rlh_lockstatus: 936880000, rlh_workingwindowstart: '2026-04-20', rlh_workingwindowend: '2026-05-22', _cr6cd_projectid_value: PRIMARY_PROJECT_ID },
  { cr6cd_buildphaseid: 'gate-proj-001-4', cr6cd_name: 'Gate 4', cr6cd_sortorder: 4, cr6cd_description: 'Finishes. Drywall complete. All finish trades sequenced and underway.', rlh_lockstatus: 936880000, rlh_workingwindowstart: '2026-05-25', rlh_workingwindowend: '2026-07-24', _cr6cd_projectid_value: PRIMARY_PROJECT_ID },
  { cr6cd_buildphaseid: 'gate-proj-001-5', cr6cd_name: 'Gate 5', cr6cd_sortorder: 5, cr6cd_description: 'Closeout. All work complete. Final inspections passed. Certificate of occupancy.', rlh_lockstatus: 936880000, rlh_workingwindowstart: '2026-07-27', rlh_workingwindowend: '2026-08-28', _cr6cd_projectid_value: PRIMARY_PROJECT_ID },
]

export const RAW_PROJECT_TRADES: DvProjectTrade[] = [
  { rlh_projecttradeid: 'project-trade-001', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-excavation', rlh_stage: 936880002, _rlh_companyid_value: 'company-010', cr6cd_tradeid: trade('trade-excavation') },
  { rlh_projecttradeid: 'project-trade-002', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-concrete', rlh_stage: 936880002, _rlh_companyid_value: 'company-011', cr6cd_tradeid: trade('trade-concrete') },
  { rlh_projecttradeid: 'project-trade-003', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-framing', rlh_stage: 936880001, _rlh_companyid_value: 'company-001', cr6cd_tradeid: trade('trade-framing') },
  { rlh_projecttradeid: 'project-trade-004', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-roofing', rlh_stage: 936880000, _rlh_companyid_value: 'company-002', cr6cd_tradeid: trade('trade-roofing') },
  { rlh_projecttradeid: 'project-trade-005', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-plumbing', rlh_stage: 936880001, _rlh_companyid_value: 'company-003', cr6cd_tradeid: trade('trade-plumbing') },
  { rlh_projecttradeid: 'project-trade-006', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-hvac', rlh_stage: 936880001, _rlh_companyid_value: 'company-004', cr6cd_tradeid: trade('trade-hvac') },
  { rlh_projecttradeid: 'project-trade-007', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-electrical', rlh_stage: 936880001, _rlh_companyid_value: 'company-005', cr6cd_tradeid: trade('trade-electrical') },
  { rlh_projecttradeid: 'project-trade-008', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-drywall', rlh_stage: 936880000, cr6cd_tradeid: trade('trade-drywall') },
  { rlh_projecttradeid: 'project-trade-009', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-cabinets', rlh_stage: 936880000, _rlh_companyid_value: 'company-006', cr6cd_tradeid: trade('trade-cabinets') },
  { rlh_projecttradeid: 'project-trade-010', _rlh_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_tradeid_value: 'trade-paint', rlh_stage: 936880000, cr6cd_tradeid: trade('trade-paint') },
]

export const RAW_MOBILIZATIONS: DvMobilization[] = [
  { cr6cd_mobilizationsid: 'mobilization-001', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-1', _rlh_projecttradeid_value: 'project-trade-001', cr6cd_why: 'Excavate for addition footprint and verify utility conflicts before foundation layout.', cr6cd_startoffset: 2, cr6cd_durationdays: 4, rlh_status: 936880003, rlh_projecttradeid: expandedProjectTrade('project-trade-001', 'trade-excavation') },
  { cr6cd_mobilizationsid: 'mobilization-002', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-1', _rlh_projecttradeid_value: 'project-trade-002', cr6cd_why: 'Complete footings and foundation walls so framing start stays on track.', cr6cd_startoffset: 9, cr6cd_durationdays: 5, rlh_status: 936880003, rlh_projecttradeid: expandedProjectTrade('project-trade-002', 'trade-concrete') },
  { cr6cd_mobilizationsid: 'mobilization-003', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-2', _rlh_projecttradeid_value: 'project-trade-003', cr6cd_why: 'Dry in the structure and lock in cabinet, mechanical, and control rough-in geometry.', cr6cd_startoffset: 21, cr6cd_durationdays: 12, rlh_status: 936880002, rlh_projecttradeid: expandedProjectTrade('project-trade-003', 'trade-framing') },
  { cr6cd_mobilizationsid: 'mobilization-004', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-2', _rlh_projecttradeid_value: 'project-trade-004', cr6cd_why: 'Make the structure weather-tight before rough MEP and finishes scheduling ramps up.', cr6cd_startoffset: 35, cr6cd_durationdays: 4, rlh_status: 936880001, rlh_projecttradeid: expandedProjectTrade('project-trade-004', 'trade-roofing') },
  { cr6cd_mobilizationsid: 'mobilization-005', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-3', _rlh_projecttradeid_value: 'project-trade-005', cr6cd_why: 'Set rough plumbing and valve bodies before insulation and drywall decisions lock.', cr6cd_startoffset: 44, cr6cd_durationdays: 5, rlh_status: 936880001, rlh_projecttradeid: expandedProjectTrade('project-trade-005', 'trade-plumbing') },
  { cr6cd_mobilizationsid: 'mobilization-006', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-3', _rlh_projecttradeid_value: 'project-trade-006', cr6cd_why: 'Coordinate radiant tubing and manifolds while framing access is still open.', cr6cd_startoffset: 47, cr6cd_durationdays: 5, rlh_status: 936880001, rlh_projecttradeid: expandedProjectTrade('project-trade-006', 'trade-hvac') },
  { cr6cd_mobilizationsid: 'mobilization-007', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-3', _rlh_projecttradeid_value: 'project-trade-007', cr6cd_why: 'Complete rough electrical and backing for controls before drywall close-in.', cr6cd_startoffset: 51, cr6cd_durationdays: 6, rlh_status: 936880001, rlh_projecttradeid: expandedProjectTrade('project-trade-007', 'trade-electrical') },
  { cr6cd_mobilizationsid: 'mobilization-008', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-4', _rlh_projecttradeid_value: 'project-trade-008', cr6cd_why: 'Hang board and stage finish quality for paint and cabinetry turnover.', cr6cd_startoffset: 72, cr6cd_durationdays: 6, rlh_status: 936880000, rlh_projecttradeid: expandedProjectTrade('project-trade-008', 'trade-drywall') },
  { cr6cd_mobilizationsid: 'mobilization-009', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-4', _rlh_projecttradeid_value: 'project-trade-010', cr6cd_why: 'Prime and paint public spaces once drywall and trim quality is ready.', cr6cd_startoffset: 84, cr6cd_durationdays: 5, rlh_status: 936880000, rlh_projecttradeid: expandedProjectTrade('project-trade-010', 'trade-paint') },
  { cr6cd_mobilizationsid: 'mobilization-010', _cr6cd_projectid_value: PRIMARY_PROJECT_ID, _cr6cd_buildphaseid_value: 'gate-proj-001-4', _rlh_projecttradeid_value: 'project-trade-009', cr6cd_why: 'Install cabinetry after finish readiness and before hardware punch begins.', cr6cd_startoffset: 94, cr6cd_durationdays: 4, rlh_status: 936880000, rlh_projecttradeid: expandedProjectTrade('project-trade-009', 'trade-cabinets') },
]

export const RAW_TRADE_ITEMS: DvTradeItem[] = [
  { rlh_tradeitemid: 'trade-item-001', _cr6cd_mobilizationsid_value: 'mobilization-001', rlh_name: 'Stake addition footprint and verify utility locates', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-002', _cr6cd_mobilizationsid_value: 'mobilization-001', rlh_name: 'Excavate to bottom of footing elevation', rlh_sortorder: 20 },
  { rlh_tradeitemid: 'trade-item-003', _cr6cd_mobilizationsid_value: 'mobilization-002', rlh_name: 'Form footings and confirm anchor bolt layout', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-004', _cr6cd_mobilizationsid_value: 'mobilization-002', rlh_name: 'Pour walls and slab, then coordinate cure protection', rlh_sortorder: 20 },
  { rlh_tradeitemid: 'trade-item-005', _cr6cd_mobilizationsid_value: 'mobilization-003', rlh_name: 'Frame main addition walls and roof structure', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-006', _cr6cd_mobilizationsid_value: 'mobilization-003', rlh_name: 'Verify rough openings against cabinetry field dimensions', rlh_sortorder: 20 },
  { rlh_tradeitemid: 'trade-item-007', _cr6cd_mobilizationsid_value: 'mobilization-004', rlh_name: 'Install sheathing and roofing underlayment', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-008', _cr6cd_mobilizationsid_value: 'mobilization-004', rlh_name: 'Dry in roof penetrations for MEP rough-in', rlh_sortorder: 20 },
  { rlh_tradeitemid: 'trade-item-009', _cr6cd_mobilizationsid_value: 'mobilization-005', rlh_name: 'Set valve bodies and rough plumbing drops', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-010', _cr6cd_mobilizationsid_value: 'mobilization-006', rlh_name: 'Confirm manifold location with framing and cabinetry', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-011', _cr6cd_mobilizationsid_value: 'mobilization-007', rlh_name: 'Install control boxes, keypad backing, and branch wiring', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-012', _cr6cd_mobilizationsid_value: 'mobilization-008', rlh_name: 'Hang board and protect critical finish elevations', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-013', _cr6cd_mobilizationsid_value: 'mobilization-009', rlh_name: 'Prime, inspect surfaces, and complete color schedule', rlh_sortorder: 10 },
  { rlh_tradeitemid: 'trade-item-014', _cr6cd_mobilizationsid_value: 'mobilization-010', rlh_name: 'Install kitchen cabinetry and final field scribe', rlh_sortorder: 10 },
]

export const RAW_MOBILIZATION_MARKERS: DvMobilizationMarker[] = [
  { cr6cd_mobilizationmarkersid: 'marker-001', _cr6cd_mobilizationsid_value: 'mobilization-001', cr6cd_name: 'Utilities cleared', cr6cd_position: 0.25 },
  { cr6cd_mobilizationmarkersid: 'marker-002', _cr6cd_mobilizationsid_value: 'mobilization-002', cr6cd_name: 'Foundation inspection', cr6cd_position: 0.65 },
  { cr6cd_mobilizationmarkersid: 'marker-003', _cr6cd_mobilizationsid_value: 'mobilization-003', cr6cd_name: 'Structural walkthrough', cr6cd_position: 0.75 },
  { cr6cd_mobilizationmarkersid: 'marker-004', _cr6cd_mobilizationsid_value: 'mobilization-005', cr6cd_name: 'Pressure test', cr6cd_position: 0.8 },
  { cr6cd_mobilizationmarkersid: 'marker-005', _cr6cd_mobilizationsid_value: 'mobilization-006', cr6cd_name: 'Tubing layout approved', cr6cd_position: 0.55 },
  { cr6cd_mobilizationmarkersid: 'marker-006', _cr6cd_mobilizationsid_value: 'mobilization-007', cr6cd_name: 'Rough electrical inspection', cr6cd_position: 0.85 },
  { cr6cd_mobilizationmarkersid: 'marker-007', _cr6cd_mobilizationsid_value: 'mobilization-010', cr6cd_name: 'Cabinet punch start', cr6cd_position: 0.9 },
]

export const RAW_TASKS: DvTask[] = [
  { rlh_taskid: 'task-001', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_mobilization_value: 'mobilization-006', rlh_name: 'Confirm manifold wall backing with framing team', rlh_notes: 'Needs decision before radiant tubing layout is released.', rlh_status: 936880001, _rlh_assignee_value: 'contact-004', _rlh_tradetype_value: 'trade-hvac', _rlh_scopeitem_value: 'scope-item-004', _rlh_projecttrade_value: 'project-trade-006', createdon: '2026-03-26T17:00:00Z' },
  { rlh_taskid: 'task-002', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_mobilization_value: 'mobilization-007', rlh_name: 'Finalize keypad count with design team', rlh_notes: 'Waiting on revised room scene list from Studio Terrain.', rlh_status: 936880003, _rlh_assignee_value: 'contact-005', _rlh_tradetype_value: 'trade-electrical', _rlh_scopeitem_value: 'scope-item-003', _rlh_costitem_value: 'cost-item-003', _rlh_projecttrade_value: 'project-trade-007', rlh_duedate: '2026-04-07', createdon: '2026-03-27T17:00:00Z' },
  { rlh_taskid: 'task-003', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_mobilization_value: 'mobilization-005', rlh_name: 'Release primary bath valve trims', rlh_notes: 'Can release after fixture finish selection is locked.', rlh_status: 936880000, _rlh_assignee_value: 'contact-003', _rlh_tradetype_value: 'trade-plumbing', _rlh_scopeitem_value: 'scope-item-002', _rlh_costitem_value: 'cost-item-005', _rlh_projecttrade_value: 'project-trade-005', rlh_duedate: '2026-04-03', createdon: '2026-03-24T17:00:00Z' },
  { rlh_taskid: 'task-004', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_mobilization_value: 'mobilization-010', rlh_ismarker: true, rlh_name: 'Field verify appliance openings before shop release', rlh_notes: 'Cabinet drawings should not go final until appliance dimensions are double-checked.', rlh_status: 936880000, _rlh_assignee_value: 'contact-006', _rlh_tradetype_value: 'trade-cabinets', _rlh_scopeitem_value: 'scope-item-001', _rlh_costitem_value: 'cost-item-001', _rlh_projecttrade_value: 'project-trade-009', createdon: '2026-03-29T17:00:00Z' },
  { rlh_taskid: 'task-005', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_mobilization_value: 'mobilization-009', rlh_name: 'Protect finished floors before prime coat', rlh_notes: 'Need builder labor support and confirmed protection sequence.', rlh_status: 936880000, _rlh_tradetype_value: 'trade-paint', _rlh_scopeitem_value: 'scope-item-005', _rlh_costitem_value: 'cost-item-006', _rlh_projecttrade_value: 'project-trade-010', createdon: '2026-03-30T17:00:00Z' },
  { rlh_taskid: 'task-006', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_mobilization_value: 'mobilization-003', rlh_ismarker: true, rlh_name: 'Structural walkthrough complete', rlh_status: 936880002, _rlh_tradetype_value: 'trade-framing', _rlh_projecttrade_value: 'project-trade-003', createdon: '2026-03-25T17:00:00Z' },
]

export const RAW_EXPECTATIONS: DvExpectation[] = [
  { rlh_expectationid: 'expectation-001', rlh_description: 'Communicate field blockers within one business day so sequencing can respond before the next mobilization is impacted.', rlh_category: 936880001, rlh_isactive: true, createdon: '2026-01-10T17:00:00Z' },
  { rlh_expectationid: 'expectation-002', rlh_description: 'Leave rough-in work inspection-ready at the end of each mobilization, including labeling and photo documentation.', rlh_category: 936880004, _rlh_tradetype_value: 'trade-electrical', rlh_isactive: true, createdon: '2026-01-11T17:00:00Z' },
  { rlh_expectationid: 'expectation-003', rlh_description: 'Coordinate protection and staging before finish materials arrive so the site stays ready for installation.', rlh_category: 936880003, rlh_isactive: true, createdon: '2026-01-12T17:00:00Z' },
  { rlh_expectationid: 'expectation-004', rlh_description: 'Pressure-test and document concealed plumbing before close-in inspection is requested.', rlh_category: 936880004, _rlh_tradetype_value: 'trade-plumbing', rlh_isactive: true, createdon: '2026-01-13T17:00:00Z' },
  { rlh_expectationid: 'expectation-005', rlh_description: 'Field-verify cabinetry dimensions against installed framing, appliance specs, and final finish floor elevations.', rlh_category: 936880003, _rlh_tradetype_value: 'trade-cabinets', rlh_isactive: true, createdon: '2026-01-14T17:00:00Z' },
]

export const RAW_PROJECT_EXPECTATIONS: DvProjectExpectation[] = [
  { rlh_projectexpectationid: 'project-expectation-001', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_expectation_value: 'expectation-001', rlh_isincluded: true, rlh_sortorder: 10, rlh_source: 936880000 },
  { rlh_projectexpectationid: 'project-expectation-002', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_expectation_value: 'expectation-002', rlh_isincluded: true, rlh_sortorder: 20, rlh_source: 936880000 },
  { rlh_projectexpectationid: 'project-expectation-003', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_expectation_value: 'expectation-003', rlh_isincluded: true, rlh_sortorder: 30, rlh_source: 936880000, rlh_customtext: 'Protect finished materials and communicate staging needs before finish trades start each area.' },
  { rlh_projectexpectationid: 'project-expectation-004', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_expectation_value: 'expectation-004', rlh_isincluded: true, rlh_sortorder: 40, rlh_source: 936880000 },
  { rlh_projectexpectationid: 'project-expectation-005', _rlh_project_value: PRIMARY_PROJECT_ID, _rlh_expectation_value: 'expectation-005', rlh_isincluded: false, rlh_sortorder: 50, rlh_source: 936880001 },
]

export const RAW_REGISTERED_FILES: DvProjectFile[] = [
  { rlh_fileid: 'file-001', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_filename: 'Whitaker Permit Set - 2026-03-18.pdf', rlh_librarykey: 'drawing_files', rlh_sharepointurl: 'https://rangeline.sharepoint.com/sites/WhitakerResidence/Drawing%20Files/Permit%20Set.pdf', rlh_sharepointsiteid: 'site-whitaker-001', rlh_sharepointdriveid: 'drive-drawing-files', rlh_sharepointitemid: 'item-drawing-001', rlh_filetype: 'application/pdf', rlh_filesize: 28400312, rlh_notes: 'Current permit set used for trade pricing.', createdon: '2026-03-18T17:00:00Z', modifiedon: '2026-03-18T17:00:00Z' },
  { rlh_fileid: 'file-002', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_filename: 'Kitchen Cabinet Shop Drawings.pdf', rlh_librarykey: 'trade_files', rlh_sharepointurl: 'https://rangeline.sharepoint.com/sites/WhitakerResidence/Trade%20Files/Cabinet%20Shop%20Drawings.pdf', rlh_sharepointsiteid: 'site-whitaker-001', rlh_sharepointdriveid: 'drive-trade-files', rlh_sharepointitemid: 'item-trade-001', rlh_filetype: 'application/pdf', rlh_filesize: 7324000, rlh_notes: 'Submitted for builder review.', createdon: '2026-03-29T17:00:00Z', modifiedon: '2026-03-29T17:00:00Z' },
  { rlh_fileid: 'file-003', _rlh_project_value: PRIMARY_PROJECT_ID, rlh_filename: 'Copper State COI.pdf', rlh_librarykey: 'admin_files', rlh_sharepointurl: 'https://rangeline.sharepoint.com/sites/WhitakerResidence/Admin%20Files/Copper%20State%20COI.pdf', rlh_sharepointsiteid: 'site-whitaker-001', rlh_sharepointdriveid: 'drive-admin-files', rlh_sharepointitemid: 'item-admin-001', rlh_filetype: 'application/pdf', rlh_filesize: 1182400, rlh_notes: 'Insurance certificate for awarded plumbing fixture package.', createdon: '2026-03-24T17:00:00Z', modifiedon: '2026-03-24T17:00:00Z' },
]

export const RAW_FILE_LINKS: DvProjectFileLink[] = [
  { rlh_filelinkid: 'file-link-001', _rlh_file_value: 'file-001', rlh_linkedrecordtype: 'rlh_scopeitems', rlh_linkedrecordid: 'scope-item-003', rlh_linkedrecordlabel: 'Lighting controls and trim devices' },
  { rlh_filelinkid: 'file-link-002', _rlh_file_value: 'file-002', rlh_linkedrecordtype: 'rlh_bidpackages', rlh_linkedrecordid: 'bid-package-001', rlh_linkedrecordlabel: 'Cabinetry Bid Package' },
  { rlh_filelinkid: 'file-link-003', _rlh_file_value: 'file-003', rlh_linkedrecordtype: 'rlh_bidpackages', rlh_linkedrecordid: 'bid-package-003', rlh_linkedrecordlabel: 'Primary Bath Plumbing Fixtures' },
]

export const RAW_SHAREPOINT_ONLY_FILES: MockSharePointOnlyFile[] = [
  { id: 'sp-file-001', projectId: PRIMARY_PROJECT_ID, libraryKey: 'field_files', name: '2026-03-30 framing progress photo.jpg', description: 'Progress photo from framing walkthrough.', sharepointUrl: 'https://rangeline.sharepoint.com/sites/WhitakerResidence/Field%20Files/framing-progress.jpg', sharePointSiteId: 'site-whitaker-001', sharePointDriveId: 'drive-field-files', sharePointItemId: 'item-field-001', fileSizeBytes: 4200144, mimeType: 'image/jpeg', createdAt: '2026-03-30T15:20:00Z', modifiedAt: '2026-03-30T15:20:00Z' },
  { id: 'sp-file-002', projectId: PRIMARY_PROJECT_ID, libraryKey: 'trade_files', name: 'Lighting Controls Cut Sheet.pdf', description: 'Manufacturer cut sheet for keypad package.', sharepointUrl: 'https://rangeline.sharepoint.com/sites/WhitakerResidence/Trade%20Files/lighting-controls-cut-sheet.pdf', sharePointSiteId: 'site-whitaker-001', sharePointDriveId: 'drive-trade-files', sharePointItemId: 'item-trade-002', fileSizeBytes: 2648200, mimeType: 'application/pdf', createdAt: '2026-03-31T10:05:00Z', modifiedAt: '2026-03-31T10:05:00Z' },
]
