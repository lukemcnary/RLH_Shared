'use client'

import { useState, useMemo } from 'react'
import type { ScopeItem, TradeType } from '@/types/database'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { SidePanel } from '@/components/side-panel'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { Input } from '@/components/input'
import { Textarea } from '@/components/textarea'
import { createScopeItemAction } from './actions'

// ── DetailRow helper ──────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) 0',
        borderBottom: '1px solid var(--border-light)',
        alignItems: 'start',
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{children}</div>
    </div>
  )
}

// ── ScopeItemRow ─────────────────────────────────────────────

interface ScopeItemRowProps {
  item: ScopeItem
  onClick: () => void
}

function ScopeItemRow({ item, onClick }: ScopeItemRowProps) {
  const spaceNames = item.spaces?.map((s) => s.name).join(', ')

  return (
    <div
      className="hover-row"
      onClick={onClick}
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
      }}
    >
      {/* Name + coordination badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: item.description || spaceNames ? 'var(--space-1)' : 0,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            flex: 1,
          }}
        >
          {item.name}
        </span>

        {/* Status badge */}
        {item.status && (
          <Badge color={item.status === 'confirmed' ? 'accent' : 'gray'}>
            {item.status === 'confirmed' ? 'Confirmed' : 'Draft'}
          </Badge>
        )}

        {/* Coordination trade badges */}
        {item.coordinationTrades?.map((t) => (
          <Badge key={t.id} color="purple">{t.name}</Badge>
        ))}
      </div>

      {/* Description */}
      {item.description && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            marginBottom: spaceNames ? 'var(--space-1)' : 0,
          }}
        >
          {item.description}
        </p>
      )}

      {/* Spaces */}
      {spaceNames && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: 'var(--text-tertiary)',
          }}
        >
          {spaceNames}
        </p>
      )}
    </div>
  )
}

// ── ScopeItemDetail (SidePanel content) ─────────────────────

interface ScopeItemDetailProps {
  item: ScopeItem
}

function ScopeItemDetail({ item }: ScopeItemDetailProps) {
  const spaceNames = item.spaces?.map((s) => s.name).join(', ')

  return (
    <div>
      {/* Status badge */}
      {item.status && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Badge color={item.status === 'confirmed' ? 'accent' : 'gray'}>
            {item.status === 'confirmed' ? 'Confirmed' : 'Draft'}
          </Badge>
        </div>
      )}

      {/* Description block */}
      {item.description && (
        <div
          style={{
            backgroundColor: 'var(--surface-muted)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {item.description}
          </p>
        </div>
      )}

      {/* Detail grid */}
      {item.tradeType && (
        <DetailRow label="Trade">
          <Badge color="accent">{item.tradeType.name}</Badge>
        </DetailRow>
      )}

      {item.coordinationTrades && item.coordinationTrades.length > 0 && (
        <DetailRow label="Coordination">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
            {item.coordinationTrades.map((t) => (
              <Badge key={t.id} color="purple">{t.name}</Badge>
            ))}
          </div>
        </DetailRow>
      )}

      {spaceNames && (
        <DetailRow label="Spaces">
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{spaceNames}</span>
        </DetailRow>
      )}

      {item.costItems && item.costItems.length > 0 && (
        <DetailRow label="Cost Items">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
            {item.costItems.map((ci) => (
              <span
                key={ci.id}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--accent)',
                  backgroundColor: 'var(--accent-medium)',
                  padding: '2px var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {ci.name}
              </span>
            ))}
          </div>
        </DetailRow>
      )}

      {item.sortOrder != null && (
        <DetailRow label="Sort Order">
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{item.sortOrder}</span>
        </DetailRow>
      )}

      {item.createdAt && (
        <DetailRow label="Added">
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </DetailRow>
      )}

      {item.notes && (
        <DetailRow label="Notes">
          <p
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {item.notes}
          </p>
        </DetailRow>
      )}
    </div>
  )
}

// ── Trade group ───────────────────────────────────────────────

interface TradeGroupProps {
  tradeName: string
  items: ScopeItem[]
  onSelectItem: (item: ScopeItem) => void
}

function TradeGroup({ tradeName, items, onSelectItem }: TradeGroupProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      {/* Group header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--surface-muted)',
          cursor: 'pointer',
          borderRadius: 'var(--radius)',
          userSelect: 'none',
        }}
      >
        {/* Chevron */}
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{
            color: 'var(--accent)',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Trade name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            flex: 1,
          }}
        >
          {tradeName}
        </span>

        {/* Item count */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--accent)',
            backgroundColor: 'var(--accent-medium)',
            padding: '1px var(--space-2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {items.length}
        </span>
      </div>

      {/* Items */}
      {expanded && (
        <div
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 var(--radius) var(--radius)',
            overflow: 'hidden',
          }}
        >
          {items.map((item) => (
            <ScopeItemRow
              key={item.id}
              item={item}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main ScopeItemsView ───────────────────────────────────────

interface Props {
  projectId: string
  scopeItems: ScopeItem[]
  tradeTypes: TradeType[]
}

export function ScopeItemsView({ projectId, scopeItems, tradeTypes }: Props) {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<ScopeItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return scopeItems
    const q = search.toLowerCase()
    return scopeItems.filter((item) => {
      if (item.name.toLowerCase().includes(q)) return true
      if (item.description?.toLowerCase().includes(q)) return true
      if (item.tradeType?.name.toLowerCase().includes(q)) return true
      if (item.spaces?.some((s) => s.name.toLowerCase().includes(q))) return true
      if (item.coordinationTrades?.some((t) => t.name.toLowerCase().includes(q))) return true
      return false
    })
  }, [scopeItems, search])

  // Group by trade
  const groups = useMemo(() => {
    const map = new Map<string, { tradeName: string; items: ScopeItem[] }>()

    for (const item of filtered) {
      const key = item.tradeTypeId ?? '__none__'
      const tradeName = item.tradeType?.name ?? 'No Trade'
      if (!map.has(key)) {
        map.set(key, { tradeName, items: [] })
      }
      map.get(key)!.items.push(item)
    }

    return Array.from(map.entries()).map(([key, val]) => ({ key, ...val }))
  }, [filtered])

  async function handleCreateScopeItem(formData: FormData) {
    await createScopeItemAction(projectId, formData)
    setShowCreate(false)
  }

  const createPanel = (
    <SidePanel open={showCreate} onClose={() => setShowCreate(false)} title="New Project Scope Item">
      <form action={handleCreateScopeItem}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Input name="name" label="Name" required />
          <Textarea name="description" label="Description" rows={4} />
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 4 }}>Trade</label>
            <select
              name="tradeTypeId"
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface-primary)',
                fontFamily: 'inherit',
              }}
            >
              <option value="">None</option>
              {tradeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </div>
        </div>
      </form>
    </SidePanel>
  )

  if (scopeItems.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
        <PageHeader title="Project Scope">
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>New Project Scope Item</Button>
        </PageHeader>
        <EmptyState
          title="No project scope yet"
          description="Add project-scope items to define the work for each trade."
        />
        {createPanel}
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="Project Scope">
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
            {filtered.length} of {scopeItems.length} items
          </span>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>New Project Scope Item</Button>
        </div>
      </PageHeader>
      {createPanel}

      {/* Search bar */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <input
          type="text"
          placeholder="Search project scope…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 13,
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different search term."
        />
      ) : (
        <div>
          {groups.map((group) => (
            <TradeGroup
              key={group.key}
              tradeName={group.tradeName}
              items={group.items}
              onSelectItem={setSelectedItem}
            />
          ))}
        </div>
      )}

      {/* Side panel */}
      <SidePanel
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.name ?? ''}
      >
        {selectedItem && <ScopeItemDetail item={selectedItem} />}
      </SidePanel>
    </div>
  )
}
