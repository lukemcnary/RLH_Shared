import { getSequencerPageData } from '@/lib/dataverse/adapter'
import { buildSequence } from '@/features/sequencer/sequence-engine'
import { SequencerBoard } from '@/features/sequencer/sequencer-board'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Trades — RangelineOS' }

export default async function ProjectTradesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pageData = await getSequencerPageData(id)

  if (!pageData) notFound()

  const { data, executionData } = pageData

  return (
    <SequencerBoard
      data={data}
      executionData={executionData}
      projection={buildSequence(executionData)}
      initialMode="trades"
      showModeTabs={false}
      pageTitle="Trades"
    />
  )
}
