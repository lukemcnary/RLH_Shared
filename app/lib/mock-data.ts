// ============================================================
// Mock Data — used when DATAVERSE_MODE=mock (the default)
// ============================================================
import type {
  Project, Gate, ProjectTrade, Mobilization,
  CostItem, Selection, BidPackage, ScopeItem,
  ScopeDetail, Task, TradeType, CostCode, Space,
  SequencerData,
  Expectation, ProjectExpectation,
  ProjectFile, Company, CompanyType, Contact, ContactRole, ProjectContact,
  Client, ChangeOrder, Rfi, Quote, Capability, CompanyCapability,
} from '@/types/database'

// ── Trade types ──────────────────────────────────────────────
export const MOCK_TRADE_TYPES: TradeType[] = [
  { id: 'trade-excavation', name: 'Excavation', code: 'EXC', color: '#8B6914' },
  { id: 'trade-concrete', name: 'Concrete', code: 'CON', color: '#6B6560' },
  { id: 'trade-framing', name: 'Framing', code: 'FRM', color: '#7A4F2E' },
  { id: 'trade-roofing', name: 'Roofing', code: 'ROF', color: '#2E4A6B' },
  { id: 'trade-plumbing', name: 'Plumbing', code: 'PLM', color: '#1A5E8A' },
  { id: 'trade-hvac', name: 'HVAC', code: 'HVC', color: '#2E6B4A' },
  { id: 'trade-electrical', name: 'Electrical', code: 'ELC', color: '#7A6B1A' },
  { id: 'trade-insulation', name: 'Insulation', code: 'INS', color: '#5E3A7A' },
  { id: 'trade-drywall', name: 'Drywall', code: 'DRY', color: '#7A5E4A' },
  { id: 'trade-flooring', name: 'Flooring', code: 'FLR', color: '#4A7A5E' },
  { id: 'trade-tile', name: 'Tile', code: 'TIL', color: '#6B4A7A' },
  { id: 'trade-cabinets', name: 'Cabinets', code: 'CAB', color: '#7A6A3A' },
  { id: 'trade-paint', name: 'Paint', code: 'PNT', color: '#3A6A7A' },
  { id: 'trade-trim', name: 'Trim & Millwork', code: 'TRM', color: '#6A3A4A' },
]

// ── Cost codes (hierarchical) ─────────────────────────────────
export const MOCK_COST_CODES: CostCode[] = [
  // Division 02 — Site Work
  { id: 'cc-div-02', code: '02', fullCode: '02', name: 'Site Work', level: 1, sortOrder: 10 },
  { id: 'cc-02-200', code: '200', fullCode: '02-200', name: 'Earthwork', level: 2, parentId: 'cc-div-02', sortOrder: 20 },
  { id: 'cc-01', code: '210', fullCode: '02-210', name: 'Site Preparation', level: 3, parentId: 'cc-02-200', tradeTypeId: 'trade-excavation', sortOrder: 30 },

  // Division 03 — Concrete
  { id: 'cc-div-03', code: '03', fullCode: '03', name: 'Concrete', level: 1, sortOrder: 40 },
  { id: 'cc-03-100', code: '100', fullCode: '03-100', name: 'Concrete Forming & Reinforcing', level: 2, parentId: 'cc-div-03', sortOrder: 50 },
  { id: 'cc-02', code: '110', fullCode: '03-110', name: 'Foundation — Footings & Walls', level: 3, parentId: 'cc-03-100', tradeTypeId: 'trade-concrete', sortOrder: 60 },
  { id: 'cc-03-200', code: '200', fullCode: '03-200', name: 'Concrete Flatwork', level: 2, parentId: 'cc-div-03', sortOrder: 70 },
  { id: 'cc-03', code: '210', fullCode: '03-210', name: 'Basement Floor Slab', level: 3, parentId: 'cc-03-200', tradeTypeId: 'trade-concrete', sortOrder: 80 },

  // Division 06 — Wood & Plastics
  { id: 'cc-div-06', code: '06', fullCode: '06', name: 'Wood & Plastics', level: 1, sortOrder: 90 },
  { id: 'cc-06-100', code: '100', fullCode: '06-100', name: 'Rough Carpentry', level: 2, parentId: 'cc-div-06', sortOrder: 100 },
  { id: 'cc-04', code: '110', fullCode: '06-110', name: 'Rough Framing', level: 3, parentId: 'cc-06-100', tradeTypeId: 'trade-framing', sortOrder: 110 },
  { id: 'cc-06-220', code: '220', fullCode: '06-220', name: 'Finish Carpentry & Millwork', level: 2, parentId: 'cc-div-06', sortOrder: 120 },
  { id: 'cc-17', code: '221', fullCode: '06-221', name: 'Trim & Millwork', level: 3, parentId: 'cc-06-220', tradeTypeId: 'trade-trim', sortOrder: 130 },
  { id: 'cc-06-400', code: '400', fullCode: '06-400', name: 'Cabinets & Casework', level: 2, parentId: 'cc-div-06', sortOrder: 140 },
  { id: 'cc-14', code: '410', fullCode: '06-410', name: 'Cabinets & Casework', level: 3, parentId: 'cc-06-400', tradeTypeId: 'trade-cabinets', sortOrder: 150 },

  // Division 07 — Thermal & Moisture
  { id: 'cc-div-07', code: '07', fullCode: '07', name: 'Thermal & Moisture Protection', level: 1, sortOrder: 160 },
  { id: 'cc-07-200', code: '200', fullCode: '07-200', name: 'Insulation', level: 2, parentId: 'cc-div-07', sortOrder: 170 },
  { id: 'cc-11', code: '210', fullCode: '07-210', name: 'Insulation', level: 3, parentId: 'cc-07-200', tradeTypeId: 'trade-insulation', sortOrder: 180 },
  { id: 'cc-07-310', code: '310', fullCode: '07-310', name: 'Roofing', level: 2, parentId: 'cc-div-07', sortOrder: 190 },
  { id: 'cc-05', code: '311', fullCode: '07-311', name: 'Roofing System', level: 3, parentId: 'cc-07-310', tradeTypeId: 'trade-roofing', sortOrder: 200 },

  // Division 09 — Finishes
  { id: 'cc-div-09', code: '09', fullCode: '09', name: 'Finishes', level: 1, sortOrder: 210 },
  { id: 'cc-09-250', code: '250', fullCode: '09-250', name: 'Gypsum Board', level: 2, parentId: 'cc-div-09', sortOrder: 220 },
  { id: 'cc-12', code: '251', fullCode: '09-251', name: 'Drywall', level: 3, parentId: 'cc-09-250', tradeTypeId: 'trade-drywall', sortOrder: 230 },
  { id: 'cc-09-300', code: '300', fullCode: '09-300', name: 'Tile', level: 2, parentId: 'cc-div-09', sortOrder: 240 },
  { id: 'cc-13', code: '310', fullCode: '09-310', name: 'Tile Work', level: 3, parentId: 'cc-09-300', tradeTypeId: 'trade-tile', sortOrder: 250 },
  { id: 'cc-09-640', code: '640', fullCode: '09-640', name: 'Wood Flooring', level: 2, parentId: 'cc-div-09', sortOrder: 260 },
  { id: 'cc-15', code: '641', fullCode: '09-641', name: 'Hardwood Flooring', level: 3, parentId: 'cc-09-640', tradeTypeId: 'trade-flooring', sortOrder: 270 },
  { id: 'cc-09-900', code: '900', fullCode: '09-900', name: 'Paints & Coatings', level: 2, parentId: 'cc-div-09', sortOrder: 280 },
  { id: 'cc-16', code: '910', fullCode: '09-910', name: 'Paint & Coatings', level: 3, parentId: 'cc-09-900', tradeTypeId: 'trade-paint', sortOrder: 290 },

  // Division 15 — Mechanical
  { id: 'cc-div-15', code: '15', fullCode: '15', name: 'Mechanical', level: 1, sortOrder: 300 },
  { id: 'cc-15-100', code: '100', fullCode: '15-100', name: 'Plumbing', level: 2, parentId: 'cc-div-15', sortOrder: 310 },
  { id: 'cc-06', code: '110', fullCode: '15-110', name: 'Rough Plumbing', level: 3, parentId: 'cc-15-100', tradeTypeId: 'trade-plumbing', sortOrder: 320 },
  { id: 'cc-07', code: '200', fullCode: '15-200', name: 'Plumbing Fixtures & Trim', level: 3, parentId: 'cc-15-100', tradeTypeId: 'trade-plumbing', sortOrder: 330 },
  { id: 'cc-15-400', code: '400', fullCode: '15-400', name: 'HVAC', level: 2, parentId: 'cc-div-15', sortOrder: 340 },
  { id: 'cc-08', code: '410', fullCode: '15-410', name: 'HVAC System', level: 3, parentId: 'cc-15-400', tradeTypeId: 'trade-hvac', sortOrder: 350 },

  // Division 16 — Electrical
  { id: 'cc-div-16', code: '16', fullCode: '16', name: 'Electrical', level: 1, sortOrder: 360 },
  { id: 'cc-16-100', code: '100', fullCode: '16-100', name: 'Electrical Rough-In', level: 2, parentId: 'cc-div-16', sortOrder: 370 },
  { id: 'cc-09', code: '110', fullCode: '16-110', name: 'Rough Electrical', level: 3, parentId: 'cc-16-100', tradeTypeId: 'trade-electrical', sortOrder: 380 },
  { id: 'cc-16-200', code: '200', fullCode: '16-200', name: 'Electrical Fixtures & Devices', level: 2, parentId: 'cc-div-16', sortOrder: 390 },
  { id: 'cc-10', code: '210', fullCode: '16-210', name: 'Electrical Fixtures & Devices', level: 3, parentId: 'cc-16-200', tradeTypeId: 'trade-electrical', sortOrder: 400 },
]

// ── Empty project data collections ──────────────────────────
export const MOCK_SPACES: Space[] = []
export const MOCK_PROJECTS: Project[] = []
export const MOCK_GATES: Gate[] = []
export const MOCK_PROJECT_TRADES: ProjectTrade[] = []
export const MOCK_MOBILIZATIONS: Mobilization[] = []
export const MOCK_COST_ITEMS: CostItem[] = []
export const MOCK_SCOPE_ITEMS: ScopeItem[] = []
export const MOCK_SCOPE_DETAILS: ScopeDetail[] = []
export const MOCK_SELECTIONS: Selection[] = []
export const MOCK_BID_PACKAGES: BidPackage[] = []
export const MOCK_TASKS: Task[] = []
export const MOCK_PROJECT_FILES: ProjectFile[] = []
export const MOCK_EXPECTATIONS: Expectation[] = []
export const MOCK_PROJECT_EXPECTATIONS: ProjectExpectation[] = []
export const MOCK_COMPANY_TYPES: CompanyType[] = []
export const MOCK_COMPANIES: Company[] = []
export const MOCK_CAPABILITIES: Capability[] = []
export const MOCK_COMPANY_CAPABILITIES: CompanyCapability[] = []
export const MOCK_CONTACT_ROLES: ContactRole[] = []
export const MOCK_CONTACTS: Contact[] = []
export const MOCK_PROJECT_CONTACTS: ProjectContact[] = []
export const MOCK_CLIENT: Client = { id: '', name: '', status: 'new' }
export const MOCK_CLIENTS: Client[] = []
export const MOCK_CHANGE_ORDERS: ChangeOrder[] = []
export const MOCK_RFIS: Rfi[] = []
export const MOCK_QUOTES: Quote[] = []

// ── Sequencer bundle ─────────────────────────────────────────
export const MOCK_SEQUENCER_DATA: SequencerData = {
  project: { id: '', name: '', status: 'planning' },
  gates: [],
  projectTrades: [],
  mobilizations: [],
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
