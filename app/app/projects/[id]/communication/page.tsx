import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

export default function CommunicationPage() {
  return (
    <div style={{ padding: '40px var(--space-6)' }}>
      <PageHeader title="Communication" />
      <EmptyState
        title="Project communication"
        description="Messages, RFIs, and project-specific correspondence will live here."
      />
    </div>
  )
}
