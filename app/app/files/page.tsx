import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

export const metadata = { title: 'Files — RangelineOS' }

export default function FilesPage() {
  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="Files" />
      <EmptyState
        title="Organization files"
        description="SOPs, knowledge base documents, and shared resources will live here."
      />
    </div>
  )
}
