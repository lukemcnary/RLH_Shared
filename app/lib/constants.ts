/**
 * Standard unit of measure options for cost items.
 */
export const UNIT_OPTIONS = [
  { value: 'ls', label: 'Lump Sum' },
  { value: 'sf', label: 'Per SF' },
  { value: 'lf', label: 'Per LF' },
  { value: 'ea', label: 'Per EA' },
  { value: 'sy', label: 'Per SY' },
  { value: 'cy', label: 'Per CY' },
  { value: 'tm', label: 'T&M' },
]

/** Lookup map for displaying unit labels */
export const UNIT_LABELS: Record<string, string> = Object.fromEntries(
  UNIT_OPTIONS.map((o) => [o.value, o.label])
)
