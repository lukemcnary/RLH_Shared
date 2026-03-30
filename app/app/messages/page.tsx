import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

export const metadata = { title: 'Messages — RangelineOS' }

export default function MessagesPage() {
  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="Messages" />
      <EmptyState
        title="Messages"
        description="Team messaging and project communication coming soon."
      />
    </div>
  )
}
