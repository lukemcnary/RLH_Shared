interface BadgeProps {
  children: React.ReactNode
  color?: 'gray' | 'accent' | 'green' | 'yellow' | 'purple' | 'danger'
}

const COLOR_STYLES: Record<string, React.CSSProperties> = {
  gray:   { backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)' },
  accent: { backgroundColor: 'var(--accent-medium)', color: 'var(--accent)' },
  green:  { backgroundColor: 'var(--green-light)', color: 'var(--green)' },
  yellow: { backgroundColor: 'var(--yellow-light)', color: 'var(--yellow)' },
  purple: { backgroundColor: 'var(--purple-light)', color: 'var(--purple)' },
  danger: { backgroundColor: 'var(--danger-light)', color: 'var(--danger)' },
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center text-xs font-medium"
      style={{ ...COLOR_STYLES[color], padding: '2px var(--space-2)', borderRadius: 'var(--radius-sm)' }}
    >
      {children}
    </span>
  )
}
