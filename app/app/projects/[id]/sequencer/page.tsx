import { getSequencerPageData } from '@/lib/dataverse/adapter'
import { buildSequence } from '@/features/sequencer/sequence-engine'
import { SequencerBoard } from '@/features/sequencer/sequencer-board'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Sequencer — RangelineOS' }

export default async function SequencerPage({
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
    />
  )
}
