import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

export default function ChangeOrdersPage() {
  return (
    <div style={{ padding: '40px var(--space-6)' }}>
      <PageHeader title="Change Orders" />
      <EmptyState
        title="No change orders"
        description="Scope and contract changes will be tracked here."
      />
    </div>
  )
}
