interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, id, style, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          color: 'var(--text-primary)',
          backgroundColor: 'var(--surface-primary)',
          outline: 'none',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
    </div>
  )
}
