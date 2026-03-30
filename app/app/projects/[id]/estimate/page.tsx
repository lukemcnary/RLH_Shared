import { getProject } from '@/lib/dataverse/adapter'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  return (
    <div style={{ padding: '40px var(--space-6)' }}>
      <PageHeader title="Estimate" />
      <EmptyState
        title="Project estimate"
        description="Build your early-stage project estimate with cost code rollups and allowances."
      />
    </div>
  )
}
