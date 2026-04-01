export interface ProjectRouteTab {
  label: string
  path: string
  description: string
}

export interface ProjectRouteGroup {
  label: string
  tabs: ProjectRouteTab[]
}

// Groups with sub-tabs (collapsible in sidebar)
export const PROJECT_ROUTE_GROUPS: ProjectRouteGroup[] = [
  {
    label: 'Development',
    tabs: [
      { label: 'Estimate', path: 'estimate', description: 'Early-stage project estimate with cost code rollups and allowances.' },
      { label: 'Project Scope', path: 'scope-items', description: 'Trade-ready project-scope statements built from project details.' },
      { label: 'Bid Packages', path: 'bid-packages', description: 'Commercial packaging and quote tracking for assigned work.' },
      { label: 'Expectations', path: 'expectations', description: 'Project-specific expectations derived from the shared library and trade context.' },
    ],
  },
  {
    label: 'Execution',
    tabs: [
      { label: 'Project Scope', path: 'scope-items', description: 'Trade-ready project-scope statements built from project details.' },
      { label: 'Sequencer', path: 'sequencer', description: 'Gate and mobilization sequencing for planned and active field work.' },
      { label: 'Trades', path: 'trades', description: 'Trade-focused execution workspace grouped by gate and mobilization.' },
      { label: 'Action Items', path: 'tasks', description: 'Project action items and checkpoints for field execution.' },
    ],
  },
  {
    label: 'Financial',
    tabs: [
      { label: 'Budget', path: 'budget', description: 'Financial view of project scope, rollups, allowances, and cost coverage.' },
      { label: 'Cost Items', path: 'cost-items', description: 'Project cost lines for budgeting, bidding, and downstream tracking.' },
      { label: 'Change Orders', path: 'change-orders', description: 'Scope and contract changes tracked at the project level.' },
    ],
  },
]

// Direct links (no sub-tabs, just navigate directly)
export interface ProjectDirectLink {
  label: string
  path: string
}

export const PROJECT_DIRECT_LINKS: ProjectDirectLink[] = [
  { label: 'Communication', path: 'communication' },
  { label: 'Files', path: 'files' },
]

export function projectHref(projectId: string, path = '') {
  return path ? `/projects/${projectId}/${path}` : `/projects/${projectId}`
}
