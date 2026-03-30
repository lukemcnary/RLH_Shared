interface SidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  headerActions?: React.ReactNode
  children?: React.ReactNode
}

export function SidePanel({ open, onClose, title, headerActions, children }: SidePanelProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full overflow-y-auto animate-slide-in-right"
        style={{
          maxWidth: '32rem', // max-w-lg
          backgroundColor: 'var(--surface-primary)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h2>
          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
            {headerActions}
            <button
              onClick={onClose}
              style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-4)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
