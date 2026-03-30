import type { CostItemStatus } from '@/types/database'

export const COST_ITEM_STATUS_LABELS: Record<CostItemStatus, string> = {
  pending: 'Pending',
  scoped: 'Scoped',
  in_bid: 'Bidding',
  awarded: 'Awarded',
  in_progress: 'In Progress',
  complete: 'Complete',
}

export const COST_ITEM_STATUS_COLORS: Record<CostItemStatus, 'gray' | 'accent' | 'yellow' | 'green' | 'purple'> = {
  pending: 'gray',
  scoped: 'accent',
  in_bid: 'yellow',
  awarded: 'green',
  in_progress: 'accent',
  complete: 'green',
}
