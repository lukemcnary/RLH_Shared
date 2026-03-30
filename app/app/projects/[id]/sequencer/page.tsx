import { getSequencerData } from '@/lib/dataverse/adapter'
import { SequencerBoard } from '@/features/sequencer/sequencer-board'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Sequencer — RangelineOS' }

export default async function SequencerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getSequencerData(id)

  if (!data) notFound()

  return <SequencerBoard data={data} />
}
