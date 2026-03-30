import { getScopeItems, getTradeTypes } from '@/lib/dataverse/adapter'
import { ScopeItemsView } from '@/features/scope-items/scope-items-view'

export const metadata = { title: 'Project Scope — RangelineOS' }

export default async function ScopeItemsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [scopeItems, tradeTypes] = await Promise.all([
    getScopeItems(id),
    getTradeTypes(),
  ])

  return <ScopeItemsView projectId={id} scopeItems={scopeItems} tradeTypes={tradeTypes} />
}
