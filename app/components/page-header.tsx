interface PageHeaderProps {
  title: string
  children?: React.ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ marginBottom: 'var(--space-4)' }}
    >
      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>
      {children && (
        <div className="flex items-center text-sm" style={{ color: 'var(--text-tertiary)', gap: 'var(--space-3)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
