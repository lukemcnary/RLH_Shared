'use client'

import { useState } from 'react'
import { CostItem, TradeType, CostItemStatus, CostItemSource } from '@/types/database'

interface Props {
  projectId: string
  costItems: CostItem[]
  tradeTypes: TradeType[]
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--surface-muted)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '8px 10px', fontSize: 13, color: 'var(--text-primary)',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', color: 'var(--text-tertiary)',
  fontWeight: 600, marginBottom: 4, display: 'block',
}

function StatusBadge({ status }: { status: CostItemStatus }) {
  const styles: Record<string, React.CSSProperties> = {
    pending:     { background: 'var(--surface-muted)', color: 'var(--text-tertiary)' },
    scoped:      { background: 'var(--accent-light)', color: 'var(--accent)' },
    in_bid:      { background: 'var(--accent-light)', color: 'var(--accent)' },
    awarded:     { background: 'var(--green-light)', color: 'var(--green)' },
    in_progress: { background: 'var(--accent-light)', color: 'var(--accent)' },
    complete:    { background: 'var(--green-light)', color: 'var(--green)' },
  }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, ...styles[status] }}>
      {status.replace('_', ' ')}
    </span>
  )
}

interface DrawerProps {
  item: CostItem
  isNew: boolean
  tradeTypes: TradeType[]
  onSave: (item: CostItem) => void
  onClose: () => void
}

function DetailDrawer({ item, isNew, tradeTypes, onSave, onClose }: DrawerProps) {
  const [draft, setDraft] = useState<CostItem>(item)

  function set(field: keyof CostItem, value: unknown) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.15)', zIndex: 99 }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 440,
        background: 'var(--surface-elevated)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', zIndex: 100, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {isNew ? 'Add Cost Item' : 'Edit Cost Item'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-tertiary)', fontFamily: 'inherit' }}>✕</button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input style={inputStyle} value={draft.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Trade</label>
            <select style={inputStyle} value={draft.tradeTypeId ?? ''} onChange={e => set('tradeTypeId', e.target.value || undefined)}>
              <option value="">— None —</option>
              {tradeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={draft.status} onChange={e => set('status', e.target.value as CostItemStatus)}>
              {(['pending','scoped','in_bid','awarded','in_progress','complete'] as CostItemStatus[]).map(s =>
                <option key={s} value={s}>{s.replace('_',' ')}</option>
              )}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Source</label>
            <select style={inputStyle} value={draft.source} onChange={e => set('source', e.target.value as CostItemSource)}>
              {(['manual','from_scope_item','from_ai'] as CostItemSource[]).map(s =>
                <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
              )}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={draft.description ?? ''} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={draft.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 5, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={() => onSave(draft)} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 5, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            Save
          </button>
        </div>
      </div>
    </>
  )
}

export function CostItemsView({ projectId, costItems: initial, tradeTypes }: Props) {
  const [items, setItems] = useState<CostItem[]>(initial)
  const [selected, setSelected] = useState<CostItem | null>(null)
  const [isNew, setIsNew] = useState(false)

  function openNew() {
    setSelected({ id: `new-${Date.now()}`, projectId, name: '', status: 'pending', source: 'manual' })
    setIsNew(true)
  }

  function openEdit(item: CostItem) {
    setSelected(item)
    setIsNew(false)
  }

  function handleSave(updated: CostItem) {
    if (isNew) {
      setItems(prev => [...prev, updated])
    } else {
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    }
    setSelected(null)
  }

  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Cost Items</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{items.length} items</p>
        </div>
        <button onClick={openNew} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          Add Cost Item
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Name','Trade','Status','Source'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const trade = tradeTypes.find(t => t.id === item.tradeTypeId)
            return (
              <tr key={item.id} className="hover-row" onClick={() => openEdit(item)} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{trade?.name ?? '—'}</td>
                <td style={{ padding: '10px 12px' }}><StatusBadge status={item.status} /></td>
                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{item.source.replace(/_/g, ' ')}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {selected && (
        <DetailDrawer
          item={selected}
          isNew={isNew}
          tradeTypes={tradeTypes}
          onSave={handleSave}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
