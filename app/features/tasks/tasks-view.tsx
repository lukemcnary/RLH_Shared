'use client'

import { useState, useMemo } from 'react'
import type { Task, TaskStatus, Gate, Mobilization, ScopeItem } from '@/types/database'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { SidePanel } from '@/components/side-panel'
import { EmptyState } from '@/components/empty-state'

const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  complete: 'Complete',
  blocked: 'Blocked',
}

const STATUS_COLORS: Record<TaskStatus, 'accent' | 'yellow' | 'green' | 'danger' | 'gray'> = {
  open: 'accent',
  in_progress: 'yellow',
  complete: 'green',
  blocked: 'danger',
}

const STATUS_ORDER: TaskStatus[] = ['open', 'in_progress', 'blocked', 'complete']

interface TasksViewProps {
  projectId: string
  tasks: Task[]
  gates: Gate[]
  mobilizations: Mobilization[]
  scopeItems: ScopeItem[]
}

export function TasksView({ projectId, tasks: initial, gates, mobilizations, scopeItems }: TasksViewProps) {
  const [items, setItems] = useState<Task[]>(initial)
  const [selected, setSelected] = useState<Task | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [search, setSearch] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    if (!search) return items
    const q = search.toLowerCase()
    return items.filter(t =>
      t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
    )
  }, [items, search])

  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    for (const s of STATUS_ORDER) groups[s] = []
    for (const t of filtered) {
      if (groups[t.status]) groups[t.status].push(t)
      else groups[t.status] = [t]
    }
    return groups
  }, [filtered])

  function handleSave(task: Task) {
    if (isNew) {
      setItems(prev => [...prev, task])
    } else {
      setItems(prev => prev.map(t => t.id === task.id ? task : t))
    }
    setSelected(null)
    setIsNew(false)
  }

  function handleAdd() {
    setSelected({
      id: `task-new-${Date.now()}`,
      projectId,
      name: '',
      status: 'open',
      isMarker: false,
    })
    setIsNew(true)
  }

  function toggleGroup(key: string) {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ padding: '40px var(--space-6)' }}>
      <PageHeader title="Action Items">
        <span className="text-sm" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-3)' }}>
          {items.length} {items.length === 1 ? 'action item' : 'action items'}
        </span>
        <Button variant="primary" size="sm" onClick={handleAdd}>Add Action Item</Button>
      </PageHeader>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          placeholder="Search action items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
          style={{
            width: '100%',
            maxWidth: 360,
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No action items yet" description="Create an action item to track work items and checkpoints." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {STATUS_ORDER.map(status => {
            const group = grouped[status] ?? []
            if (group.length === 0) return null
            const collapsed = collapsedGroups[status]
            return (
              <div key={status} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button
                  onClick={() => toggleGroup(status)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--surface-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 150ms', color: 'var(--text-tertiary)' }}>
                    <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {STATUS_LABELS[status]}
                  </span>
                  <Badge color={STATUS_COLORS[status]}>{group.length}</Badge>
                </button>
                {!collapsed && (
                  <div>
                    {group.map(task => (
                      <div
                        key={task.id}
                        className="hover-row"
                        onClick={() => { setSelected(task); setIsNew(false) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-3) var(--space-4)',
                          borderTop: '1px solid var(--border-light)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
                          {task.isMarker && (
                            <span style={{ fontSize: 11, padding: '1px 5px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--purple-light, #F0E6FF)', color: 'var(--purple, #7C3AED)' }}>
                              marker
                            </span>
                          )}
                          <span className="text-sm" style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                          {task.gateId && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)', padding: '1px 6px', backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                              {gates.find(g => g.id === task.gateId)?.name ?? 'Gate'}
                            </span>
                          )}
                          {task.mobilizationId && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)', padding: '1px 6px', backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)' }}>
                              {(() => {
                                const mob = mobilizations.find(m => m.id === task.mobilizationId)
                                return mob ? (mob.tradeType?.name ?? 'Mob') : 'Mob'
                              })()}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          <Badge color={STATUS_COLORS[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <TaskPanel
          task={selected}
          isNew={isNew}
          gates={gates}
          mobilizations={mobilizations}
          scopeItems={scopeItems}
          onSave={handleSave}
          onClose={() => { setSelected(null); setIsNew(false) }}
        />
      )}
    </div>
  )
}

// ── Task edit panel ──────────────────────────────────────────

interface TaskPanelProps {
  task: Task
  isNew: boolean
  gates: Gate[]
  mobilizations: Mobilization[]
  scopeItems: ScopeItem[]
  onSave: (task: Task) => void
  onClose: () => void
}

function TaskPanel({ task, isNew, gates, mobilizations, scopeItems, onSave, onClose }: TaskPanelProps) {
  const [draft, setDraft] = useState<Task>(task)

  function set<K extends keyof Task>(field: K, value: Task[K]) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-tertiary)',
    marginBottom: 4,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--surface-primary)',
  }

  return (
    <SidePanel open={true} title={isNew ? 'New Action Item' : 'Edit Action Item'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} value={draft.name} onChange={e => set('name', e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select className="select-styled" style={inputStyle} value={draft.status} onChange={e => set('status', e.target.value as TaskStatus)}>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input type="checkbox" id="isMarker" checked={draft.isMarker || false} onChange={e => set('isMarker', e.target.checked)} />
          <label htmlFor="isMarker" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Marker (checkpoint event)</label>
        </div>

        <div>
          <label style={labelStyle}>Due Date</label>
          <input type="date" style={inputStyle} value={draft.dueDate ?? ''} onChange={e => set('dueDate', e.target.value || undefined)} />
        </div>

        <div>
          <label style={labelStyle}>Gate</label>
          <select className="select-styled" style={inputStyle} value={draft.gateId ?? ''} onChange={e => set('gateId', e.target.value || undefined)}>
            <option value="">None</option>
            {gates.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Mobilization</label>
          <select className="select-styled" style={inputStyle} value={draft.mobilizationId ?? ''} onChange={e => set('mobilizationId', e.target.value || undefined)}>
            <option value="">None</option>
            {mobilizations.map(m => <option key={m.id} value={m.id}>{m.tradeType?.name ?? m.id} — {m.why?.slice(0, 40)}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Project Scope</label>
          <select className="select-styled" style={inputStyle} value={draft.scopeItemId ?? ''} onChange={e => set('scopeItemId', e.target.value || undefined)}>
            <option value="">None</option>
            {scopeItems.map(si => <option key={si.id} value={si.id}>{si.name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={draft.description ?? ''} onChange={e => set('description', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-light)' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(draft)}>Save</Button>
        </div>
      </div>
    </SidePanel>
  )
}
