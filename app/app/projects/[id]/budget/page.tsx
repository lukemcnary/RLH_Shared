import { getCostItems, getCostCodes, getTradeTypes } from '@/lib/dataverse/adapter'
import { BudgetView } from '@/features/budget/budget-view'

export const metadata = { title: 'Budget — RangelineOS' }

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [costItems, costCodes, tradeTypes] = await Promise.all([
    getCostItems(id),
    getCostCodes(),
    getTradeTypes(),
  ])

  return <BudgetView projectId={id} costItems={costItems} costCodes={costCodes} tradeTypes={tradeTypes} />
}
