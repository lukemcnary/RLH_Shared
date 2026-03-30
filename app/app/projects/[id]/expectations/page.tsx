import { getProjectExpectations, getExpectations, getTradeTypes } from '@/lib/dataverse/adapter'
import { ExpectationsView } from '@/features/expectations/expectations-view'

export const metadata = { title: 'Expectations — RangelineOS' }

export default async function ExpectationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [projectExpectations, expectations, tradeTypes] = await Promise.all([
    getProjectExpectations(id),
    getExpectations(),
    getTradeTypes(),
  ])

  return (
    <ExpectationsView
      projectId={id}
      projectExpectations={projectExpectations}
      expectations={expectations}
      tradeTypes={tradeTypes}
    />
  )
}
