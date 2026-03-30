'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { Expectation, ProjectExpectation, TradeType, ExpectationCategory } from '@/types/database'
import { SidePanel } from '@/components/side-panel'
import { Button } from '@/components/button'
import { Textarea } from '@/components/textarea'
import {
  updateProjectExpectation,
  populateProjectExpectations,
  createExpectationForProject,
} from './actions'

// ─── Constants ───────────────────────────────────────────────

const CATEGORY_LABELS: Record<ExpectationCategory, string> = {
  general: 'General',
  communication: 'Communication',
  site_conditions: 'Site Conditions',
  preparation_coordination: 'Preparation & Coordination',
  quality_standards: 'Quality Standards',
}

const CATEGORY_ORDER: ExpectationCategory[] = [
  'general',
  'communication',
  'site_conditions',
  'preparation_coordination',
  'quality_standards',
]

// ─── Props ───────────────────────────────────────────────────

interface ExpectationsViewProps {
  projectId: string
  projectExpectations: ProjectExpectation[]
  expectations: Expectation[]
  tradeTypes: TradeType[]
}

// ─── Component ───────────────────────────────────────────────

export function ExpectationsView({
  projectId,
  projectExpectations,
  expectations,
  tradeTypes,
}: ExpectationsViewProps) {
  const [isPending, startTransition] = useTransition()
  const [filterCategory, setFilterCategory] = useState<ExpectationCategory | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)

  // Join expectations onto project expectations for display
  const enriched = projectExpectations.map(pe => ({
    ...pe,
    expectation: pe.expectation ?? expectations.find(e => e.id === pe.expectationId),
  }))

  // Group by category
  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: enriched
      .filter(pe => pe.expectation?.category === cat)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  })).filter(g => g.items.length > 0)

  // Filter if active
  const displayed = filterCategory === 'all'
    ? grouped
    : grouped.filter(g => g.category === filterCategory)

  // Trade type lookup
  const tradeMap = new Map(tradeTypes.map(t => [t.id, t]))

  function handleToggle(peId: string, currentIncluded: boolean) {
    startTransition(async () => {
      await updateProjectExpectation(
        { id: peId, isIncluded: !currentIncluded },
        projectId
      )
    })
  }

  function handlePopulate() {
    startTransition(async () => {
      await populateProjectExpectations(projectId)
    })
  }

  const includedCount = enriched.filter(pe => pe.isIncluded).length
  const totalCount = enriched.length

  return (
    <div style={{ padding: '40px var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}
          >
            Expectations
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {includedCount} of {totalCount} included in document
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={handlePopulate}
            disabled={isPending}
            className="text-sm font-medium"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: isPending ? 'wait' : 'pointer',
              opacity: isPending ? 0.6 : 1,
              fontFamily: 'inherit',
            }}
          >
            Populate from Library
          </button>
          <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
            New Expectation
          </Button>
          <Link
            href={`/projects/${projectId}/expectations/document`}
            className="text-sm font-medium"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent)',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            View Document
          </Link>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <FilterChip label="All" active={filterCategory === 'all'} onClick={() => setFilterCategory('all')} />
        {CATEGORY_ORDER.map(cat => (
          <FilterChip
            key={cat}
            label={CATEGORY_LABELS[cat]}
            active={filterCategory === cat}
            onClick={() => setFilterCategory(cat)}
          />
        ))}
      </div>

      {/* Expectation list grouped by category */}
      {displayed.length === 0 ? (
        <div style={{ padding: 'var(--space-7)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <p className="text-sm">No expectations yet. Click &ldquo;Populate from Library&rdquo; to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {displayed.map(group => (
            <div key={group.category}>
              <h2
                className="text-xs font-semibold uppercase"
                style={{
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.06em',
                  marginBottom: 'var(--space-2)',
                  padding: '0 var(--space-1)',
                }}
              >
                {group.label}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map(pe => {
                  const exp = pe.expectation!
                  const trade = exp.tradeTypeId ? tradeMap.get(exp.tradeTypeId) : null
                  const displayText = pe.customText || exp.description
                  return (
                    <div
                      key={pe.id}
                      className="hover-row"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        opacity: pe.isIncluded ? 1 : 0.5,
                      }}
                    >
                      {/* Inclusion checkbox */}
                      <input
                        type="checkbox"
                        checked={pe.isIncluded}
                        onChange={() => handleToggle(pe.id, pe.isIncluded)}
                        disabled={isPending}
                        style={{ marginTop: 3, flexShrink: 0 }}
                      />
                      {/* Text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          className="text-sm"
                          style={{
                            color: 'var(--text-primary)',
                            textDecoration: pe.isIncluded ? 'none' : 'line-through',
                          }}
                        >
                          {displayText}
                        </p>
                        {pe.customText && (
                          <p
                            className="text-xs"
                            style={{ color: 'var(--text-tertiary)', marginTop: 2 }}
                          >
                            Custom wording (original: {exp.description.slice(0, 60)}{exp.description.length > 60 ? '...' : ''})
                          </p>
                        )}
                      </div>
                      {/* Trade badge */}
                      {trade && (
                        <span
                          className="text-xs"
                          style={{
                            flexShrink: 0,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: trade.color ? `${trade.color}20` : 'var(--accent-light)',
                            color: trade.color ?? 'var(--accent)',
                          }}
                        >
                          {trade.code}
                        </span>
                      )}
                      {/* Source badge */}
                      <span
                        className="text-xs"
                        style={{
                          flexShrink: 0,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--accent-light)',
                          color: 'var(--accent)',
                        }}
                      >
                        {pe.source}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create panel */}
      <SidePanel open={showCreate} onClose={() => setShowCreate(false)} title="New Expectation">
        <form action={async (formData: FormData) => {
          await createExpectationForProject(projectId, formData)
          setShowCreate(false)
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Textarea name="description" label="Description" rows={4} required />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 4 }}>Category</label>
              <select
                name="category"
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
                {CATEGORY_ORDER.map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 4 }}>Trade (optional)</label>
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
                <option value="">All trades (general)</option>
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
    </div>
  )
}


// ─── Sub-components ──────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium"
      style={{
        padding: '4px 10px',
        borderRadius: 'var(--radius-full, 999px)',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        backgroundColor: active ? 'var(--accent-light)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
