interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

const VARIANT_STYLES: Record<string, { css: React.CSSProperties; className: string }> = {
  primary: {
    css: { backgroundColor: 'var(--accent)', color: '#FFFFFF', border: '1px solid var(--accent)' },
    className: 'btn-primary',
  },
  secondary: {
    css: { backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    className: 'btn-secondary',
  },
  ghost: {
    css: { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
    className: 'btn-ghost',
  },
  danger: {
    css: { backgroundColor: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid transparent' },
    className: 'btn-ghost',
  },
}

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { padding: 'var(--space-1) var(--space-3)', fontSize: '13px' },
  md: { padding: 'var(--space-2) var(--space-3)', fontSize: '14px' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const v = VARIANT_STYLES[variant]
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${v.className} ${className}`}
      style={{ ...v.css, ...SIZE_STYLES[size], borderRadius: 'var(--radius-md)' }}
      {...props}
    >
      {children}
    </button>
  )
}
