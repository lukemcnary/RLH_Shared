import { getCostItems, getTradeTypes } from '@/lib/dataverse/adapter'
import { CostItemsView } from '@/features/cost-items/cost-items-view'

export const metadata = { title: 'Cost Items — RangelineOS' }

export default async function CostItemsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [costItems, tradeTypes] = await Promise.all([
    getCostItems(id),
    getTradeTypes(),
  ])

  return <CostItemsView projectId={id} costItems={costItems} tradeTypes={tradeTypes} />
}
