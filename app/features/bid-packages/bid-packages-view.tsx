'use client'

import { useState } from 'react'
import type { BidPackage, CostItem, TradeType, BidPackageStatus, Quote, QuoteStatus, Company } from '@/types/database'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/badge'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'

// ── Status config ─────────────────────────────────────────────

const BID_PACKAGE_STATUS_LABELS: Record<BidPackageStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  reviewing: 'Reviewing',
  awarded: 'Awarded',
}

const BID_PACKAGE_STATUS_COLORS: Record<BidPackageStatus, 'gray' | 'accent' | 'yellow' | 'green'> = {
  draft: 'gray',
  sent: 'accent',
  reviewing: 'yellow',
  awarded: 'green',
}

// ── BidPackageCard ────────────────────────────────────────────

const QUOTE_STATUS_COLORS: Record<QuoteStatus, 'accent' | 'green' | 'danger'> = {
  pending: 'accent',
  accepted: 'green',
  rejected: 'danger',
}

interface BidPackageCardProps {
  bidPackage: BidPackage
  allCostItems: CostItem[]
  tradeTypes: TradeType[]
  quotes: Quote[]
  companies: Company[]
  onStatusChange: (id: string, status: BidPackageStatus) => void
}

function BidPackageCard({ bidPackage, allCostItems, tradeTypes, quotes, companies, onStatusChange }: BidPackageCardProps) {
  const [expanded, setExpanded] = useState(false)

  const trade = tradeTypes.find((t) => t.id === bidPackage.tradeTypeId)
  const linkedItems = allCostItems.filter((ci) =>
    bidPackage.costItemIds?.includes(ci.id)
  )

  const estimateLow = linkedItems.reduce((s, ci) => s + (ci.estimateLow ?? 0), 0)
  const estimateHigh = linkedItems.reduce((s, ci) => s + (ci.estimateHigh ?? 0), 0)
  const hasEstimates = estimateLow > 0 || estimateHigh > 0

  function getNextStatus(current: BidPackageStatus): BidPackageStatus | null {
    if (current === 'draft') return 'sent'
    if (current === 'sent') return 'reviewing'
    if (current === 'reviewing') return 'awarded'
    return null
  }

  function getActionLabel(current: BidPackageStatus): string | null {
    if (current === 'draft') return 'Send for Bid'
    if (current === 'sent') return 'Mark as Reviewing'
    if (current === 'reviewing') return 'Mark as Awarded'
    return null
  }

  const nextStatus = getNextStatus(bidPackage.status)
  const actionLabel = getActionLabel(bidPackage.status)

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-primary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        marginBottom: 'var(--space-3)',
      }}
    >
      {/* Card header */}
      <div
        onClick={() => setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        className="hover-row"
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

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {bidPackage.name}
            </span>
            <Badge color={BID_PACKAGE_STATUS_COLORS[bidPackage.status]}>
              {BID_PACKAGE_STATUS_LABELS[bidPackage.status]}
            </Badge>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {trade?.name ?? 'No trade'}
            {linkedItems.length > 0 && (
              <> &middot; {linkedItems.length} item{linkedItems.length !== 1 ? 's' : ''}</>
            )}
            {bidPackage.dueDate && (
              <> &middot; Due {new Date(bidPackage.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
            )}
          </div>
        </div>

        {/* Estimate range */}
        {hasEstimates && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatCurrency(estimateLow)} – {formatCurrency(estimateHigh)}
          </span>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--border-light)',
          }}
        >
          {/* Description */}
          {bidPackage.description && (
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--border-light)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {bidPackage.description}
              </p>
            </div>
          )}

          {/* Actions bar */}
          {actionLabel && nextStatus && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--surface-muted)',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusChange(bidPackage.id, nextStatus)
                }}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {actionLabel}
              </button>
            </div>
          )}

          {/* Cost Items section */}
          <div>
            <div
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--surface-muted)',
              }}
            >
              Cost Items
            </div>

            {linkedItems.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-4)',
                  fontSize: 13,
                  color: 'var(--text-tertiary)',
                  textAlign: 'center',
                }}
              >
                No cost items linked to this package.
              </div>
            ) : (
              linkedItems.map((ci) => {
                const ciTrade = tradeTypes.find((t) => t.id === ci.tradeTypeId)
                return (
                  <div
                    key={ci.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2) var(--space-4)',
                      borderBottom: '1px solid var(--border-light)',
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {ci.name}
                    </span>
                    {ciTrade && (
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {ciTrade.name}
                      </span>
                    )}
                    {(ci.estimateLow != null || ci.estimateHigh != null) && (
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          fontVariantNumeric: 'tabular-nums',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {formatCurrency(ci.estimateLow)} – {formatCurrency(ci.estimateHigh)}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Quotes section */}
          <div>
            {(() => {
              const pkgQuotes = quotes.filter(q => q.bidPackageId === bidPackage.id)
              return pkgQuotes.length > 0 ? (
                <div>
                  <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--surface-muted)' }}>
                    Quotes ({pkgQuotes.length})
                  </div>
                  {pkgQuotes.map(q => {
                    const company = companies.find(c => c.id === q.companyId)
                    return (
                      <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)', backgroundColor: q.status === 'accepted' ? 'var(--green-light, #ECFDF5)' : undefined }}>
                        <div>
                          <span className="text-sm" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{company?.name ?? 'Unknown'}</span>
                          {q.receivedDate && <span className="text-xs" style={{ color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>{new Date(q.receivedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <span className="text-sm" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)' }}>{formatCurrency(q.amount)}</span>
                          <Badge color={QUOTE_STATUS_COLORS[q.status]}>{q.status}</Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null
            })()}
            {quotes.filter(q => q.bidPackageId === bidPackage.id).length === 0 && (
            <div>
            <div
              style={{
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: 'var(--surface-muted)',
              }}
            >
              Quotes
            </div>
            <div
              style={{
                padding: 'var(--space-4)',
                fontSize: 13,
                color: 'var(--text-tertiary)',
                textAlign: 'center',
              }}
            >
              {bidPackage.status === 'draft'
                ? 'Send the package to collect quotes.'
                : 'No quotes received yet.'}
            </div>
          </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main BidPackagesView ──────────────────────────────────────

interface Props {
  projectId: string
  bidPackages: BidPackage[]
  costItems: CostItem[]
  tradeTypes: TradeType[]
  quotes: Quote[]
  companies: Company[]
}

export function BidPackagesView({ projectId, bidPackages: initial, costItems, tradeTypes, quotes, companies }: Props) {
  void projectId
  const [packages, setPackages] = useState<BidPackage[]>(initial)

  function handleStatusChange(id: string, status: BidPackageStatus) {
    setPackages((prev) =>
      prev.map((bp) => bp.id === id ? { ...bp, status } : bp)
    )
  }

  if (packages.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
        <PageHeader title="Bid Packages" />
        <EmptyState
          title="No bid packages yet"
          description="Create bid packages to collect quotes from trade partners."
        />
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="Bid Packages">
        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
          {packages.length} package{packages.length !== 1 ? 's' : ''}
        </span>
      </PageHeader>

      <div>
        {packages.map((bp) => (
          <BidPackageCard
            key={bp.id}
            bidPackage={bp}
            allCostItems={costItems}
            tradeTypes={tradeTypes}
            quotes={quotes}
            companies={companies}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
