'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { Client, ClientStatus } from '@/types/database'
import { CLIENT_BOARD_STATUSES, CLIENT_STATUS_LABELS } from '@/types/database'
import { Button } from '@/components/button'
import { LeadCard } from './lead-card'
import { LeadForm } from './lead-form'
import { updateLeadStatusAction } from './actions'

interface LeadsBoardProps {
  initialClients: Client[]
}

function DroppableColumn({
  status,
  count,
  children,
}: {
  status: string
  count: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        minWidth: 260,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? 'var(--accent-light)' : 'var(--surface-muted)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3)',
        transition: 'background-color 150ms ease',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ padding: '0 var(--space-1)', marginBottom: 'var(--space-3)' }}
      >
        <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
          {CLIENT_STATUS_LABELS[status as ClientStatus]}
        </span>
        <span className="text-xs" style={{
          color: 'var(--text-tertiary)',
          backgroundColor: 'var(--surface-elevated)',
          borderRadius: 'var(--radius-sm)',
          padding: '1px 6px',
          minWidth: 18,
          textAlign: 'center',
        }}>
          {count}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

export function LeadsBoard({ initialClients }: LeadsBoardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [showForm, setShowForm] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const grouped = CLIENT_BOARD_STATUSES.reduce(
    (acc, status) => {
      acc[status] = clients.filter(c => c.status === status)
      return acc
    },
    {} as Record<string, Client[]>
  )

  const activeClient = activeId ? clients.find(c => c.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const clientId = active.id as string
    const newStatus = over.id as ClientStatus
    const client = clients.find(c => c.id === clientId)
    if (!client || client.status === newStatus) return

    // Optimistic update
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c))

    try {
      await updateLeadStatusAction(clientId, newStatus)
    } catch {
      // Revert on error
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: client.status } : c))
    }
  }

  function handleUpdated(updated: Client) {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  function handleDeleted(id: string) {
    setClients(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Leads
        </h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          New Lead
        </Button>
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4) var(--space-5)' }}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', minHeight: '100%' }}>
            {CLIENT_BOARD_STATUSES.map(status => (
              <DroppableColumn key={status} status={status} count={(grouped[status] ?? []).length}>
                {(grouped[status] ?? []).map(client => (
                  <LeadCard
                    key={client.id}
                    client={client}
                    isDragging={activeId === client.id}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                ))}
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay>
            {activeClient ? (
              <LeadCard
                client={activeClient}
                isOverlay
                onUpdated={() => {}}
                onDeleted={() => {}}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <LeadForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}
