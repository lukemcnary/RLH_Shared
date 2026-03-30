interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

const DEFAULT_ICON = (
  <svg
    className="w-6 h-6"
    style={{ color: 'var(--text-tertiary)' }}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export function EmptyState({ title, description, icon, children }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: 'var(--space-7) var(--space-4)' }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: '52px',
          height: '52px',
          backgroundColor: 'var(--accent-light)',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--space-3)',
        }}
      >
        {icon ?? DEFAULT_ICON}
      </div>
      <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  )
}
