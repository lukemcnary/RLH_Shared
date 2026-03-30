const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—'
  if (amount === 0) return '$0'
  return currencyFormatter.format(amount)
}
