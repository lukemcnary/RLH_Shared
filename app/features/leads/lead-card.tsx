'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { Client } from '@/types/database'
import { Button } from '@/components/button'
import { LeadDetail } from './lead-detail'
import { ProjectWizard } from './project-wizard'

interface LeadCardProps {
  client: Client
  isDragging?: boolean
  isOverlay?: boolean
  onUpdated: (updated: Client) => void
  onDeleted: (id: string) => void
}

export function LeadCard({ client, isDragging, isOverlay, onUpdated, onDeleted }: LeadCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: client.id,
  })

  const style: React.CSSProperties = {
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3)',
    boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
    opacity: isDragging && !isOverlay ? 0.4 : 1,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    cursor: 'grab',
    touchAction: 'none',
  }

  return (
    <>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {client.name}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetail(true) }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: 2,
              lineHeight: 1,
              flexShrink: 0,
            }}
            title="View details"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
        </div>

        {client.projectAddress && (
          <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {client.projectAddress}
          </p>
        )}

        {client.projectDescription && (
          <p className="text-xs" style={{
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-1)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {client.projectDescription}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {client.createdAt
              ? new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ''}
          </span>
          {client.source && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)', padding: '1px 5px', backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)' }}>
              {client.source}
            </span>
          )}
        </div>

        {client.status === 'agreement_signed' && (
          <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-light)' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setShowWizard(true) }}
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
              style={{ width: '100%' }}
            >
              Create Project
            </Button>
          </div>
        )}
      </div>

      <LeadDetail
        client={client}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onUpdated={onUpdated}
        onDeleted={onDeleted}
      />

      {showWizard && (
        <ProjectWizard
          client={client}
          open={showWizard}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  )
}
