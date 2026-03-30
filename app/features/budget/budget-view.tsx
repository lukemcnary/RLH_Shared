'use client'

import { useState, useMemo } from 'react'
import type { CostCode, CostItem, TradeType } from '@/types/database'
import { formatCurrency } from '@/lib/format'
import { Badge } from '@/components/badge'
import { SidePanel } from '@/components/side-panel'
import { PageHeader } from '@/components/page-header'
import { COST_ITEM_STATUS_LABELS, COST_ITEM_STATUS_COLORS } from './cost-item-constants'

// ── Tree types ────────────────────────────────────────────────

interface CostCodeNode {
  costCode: CostCode
  children: CostCodeNode[]
  costItems: CostItem[]
  estimateLowTotal: number
  estimateHighTotal: number
}

// ── Tree builder ─────────────────────────────────────────────

function buildTree(costCodes: CostCode[], costItems: CostItem[]): CostCodeNode[] {
  const nodeMap = new Map<string, CostCodeNode>()

  // Create a node for each cost code
  for (const cc of costCodes) {
    const items = costItems.filter((ci) => ci.costCodeId === cc.id)
    const directLow = items.reduce((s, i) => s + (i.estimateLow ?? 0), 0)
    const directHigh = items.reduce((s, i) => s + (i.estimateHigh ?? 0), 0)
    nodeMap.set(cc.id, {
      costCode: cc,
      children: [],
      costItems: items,
      estimateLowTotal: directLow,
      estimateHighTotal: directHigh,
    })
  }

  // Wire up parent-child relationships
  const roots: CostCodeNode[] = []
  for (const cc of costCodes) {
    const node = nodeMap.get(cc.id)!
    if (cc.parentId) {
      const parent = nodeMap.get(cc.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  // Roll up estimates from leaves to roots
  function rollUp(node: CostCodeNode): void {
    for (const child of node.children) {
      rollUp(child)
      node.estimateLowTotal += child.estimateLowTotal
      node.estimateHighTotal += child.estimateHighTotal
    }
  }
  for (const root of roots) {
    rollUp(root)
  }

  return roots
}

// ── CostItemRow ───────────────────────────────────────────────

interface CostItemRowProps {
  item: CostItem
  tradeTypes: TradeType[]
  onClick: () => void
}

function CostItemRow({ item, tradeTypes, onClick }: CostItemRowProps) {
  const trade = tradeTypes.find((t) => t.id === item.tradeTypeId)
  return (
    <div
      className="hover-row"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-2) var(--space-4)',
        paddingLeft: 'calc(var(--space-6) + var(--space-6))',
        borderBottom: '1px solid var(--border-light)',
        cursor: 'pointer',
      }}
    >
      {/* Name */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.name}
      </div>

      {/* Trade badge */}
      {trade && (
        <Badge color="accent">{trade.name}</Badge>
      )}

      {/* Estimate range */}
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {formatCurrency(item.estimateLow)} – {formatCurrency(item.estimateHigh)}
      </div>

      {/* Status badge */}
      <Badge color={COST_ITEM_STATUS_COLORS[item.status]}>
        {COST_ITEM_STATUS_LABELS[item.status]}
      </Badge>
    </div>
  )
}

// ── CostCodeGroup ─────────────────────────────────────────────

interface CostCodeGroupProps {
  node: CostCodeNode
  tradeTypes: TradeType[]
  onSelectItem: (item: CostItem) => void
  depth?: number
}

function CostCodeGroup({ node, tradeTypes, onSelectItem, depth = 0 }: CostCodeGroupProps) {
  const [expanded, setExpanded] = useState(true)
  const { costCode, children, costItems, estimateLowTotal, estimateHighTotal } = node
  const hasEstimates = estimateLowTotal > 0 || estimateHighTotal > 0
  const hasChildren = children.length > 0 || costItems.length > 0
  const totalItems = costItems.length + children.reduce((s, c) => s + c.costItems.length, 0)

  const isLevel1 = depth === 0
  const chevronSize = isLevel1 ? 'w-4 h-4' : 'w-3 h-3'

  const indentLeft = depth === 0
    ? 'var(--space-4)'
    : depth === 1
    ? 'var(--space-5)'
    : 'var(--space-6)'

  return (
    <div>
      {/* Header row */}
      <div
        onClick={() => hasChildren && setExpanded((e) => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: `var(--space-2) var(--space-4)`,
          paddingLeft: indentLeft,
          borderBottom: '1px solid var(--border)',
          cursor: hasChildren ? 'pointer' : 'default',
          backgroundColor: isLevel1 ? 'var(--surface-muted)' : undefined,
          userSelect: 'none',
        }}
        className={!isLevel1 ? 'hover-row' : undefined}
      >
        {/* Chevron */}
        <svg
          className={chevronSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{
            color: 'var(--accent)',
            flexShrink: 0,
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            opacity: hasChildren ? 1 : 0,
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        {/* Code */}
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: isLevel1 ? 12 : 11,
            color: 'var(--accent)',
            opacity: 0.7,
            flexShrink: 0,
            minWidth: isLevel1 ? 36 : 56,
          }}
        >
          {costCode.fullCode}
        </span>

        {/* Name */}
        <span
          style={{
            fontSize: isLevel1 ? 13 : 12,
            fontWeight: isLevel1 ? 600 : 500,
            color: 'var(--text-primary)',
            flex: 1,
          }}
        >
          {costCode.name}
        </span>

        {/* Item count badge (level 2+) */}
        {!isLevel1 && totalItems > 0 && (
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
            {totalItems}
          </span>
        )}

        {/* Estimate range */}
        {hasEstimates && (
          <span
            style={{
              fontSize: 12,
              color: isLevel1 ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isLevel1 ? 600 : 400,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatCurrency(estimateLowTotal)} – {formatCurrency(estimateHighTotal)}
          </span>
        )}
      </div>

      {/* Expanded children */}
      {expanded && (
        <div>
          {children.map((child) => (
            <CostCodeGroup
              key={child.costCode.id}
              node={child}
              tradeTypes={tradeTypes}
              onSelectItem={onSelectItem}
              depth={depth + 1}
            />
          ))}
          {costItems.map((item) => (
            <CostItemRow
              key={item.id}
              item={item}
              tradeTypes={tradeTypes}
              onClick={() => onSelectItem(item)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

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

// ── CostItemDetail (SidePanel content) ───────────────────────

interface CostItemDetailProps {
  item: CostItem
  costCodes: CostCode[]
  tradeTypes: TradeType[]
}

function CostItemDetail({ item, costCodes, tradeTypes }: CostItemDetailProps) {
  const costCode = costCodes.find((c) => c.id === item.costCodeId)
  const trade = tradeTypes.find((t) => t.id === item.tradeTypeId)

  return (
    <div>
      <DetailRow label="Status">
        <Badge color={COST_ITEM_STATUS_COLORS[item.status]}>
          {COST_ITEM_STATUS_LABELS[item.status]}
        </Badge>
      </DetailRow>

      {costCode && (
        <DetailRow label="Cost Code">
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 12,
              color: 'var(--accent)',
              marginRight: 'var(--space-2)',
            }}
          >
            {costCode.fullCode}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{costCode.name}</span>
        </DetailRow>
      )}

      {trade && (
        <DetailRow label="Trade">
          <Badge color="accent">{trade.name}</Badge>
        </DetailRow>
      )}

      {item.description && (
        <DetailRow label="Description">
          <p
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {item.description}
          </p>
        </DetailRow>
      )}

      <DetailRow label="Estimate Low">
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(item.estimateLow)}
        </span>
      </DetailRow>

      <DetailRow label="Estimate High">
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(item.estimateHigh)}
        </span>
      </DetailRow>

      <DetailRow label="Awarded">
        <span style={{ fontVariantNumeric: 'tabular-nums', color: item.awardedAmount ? 'var(--green)' : 'var(--text-tertiary)' }}>
          {formatCurrency(item.awardedAmount)}
        </span>
      </DetailRow>

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

// ── Main BudgetView ───────────────────────────────────────────

interface Props {
  projectId: string
  costItems: CostItem[]
  costCodes: CostCode[]
  tradeTypes: TradeType[]
}

export function BudgetView({ projectId, costItems, costCodes, tradeTypes }: Props) {
  void projectId
  const [selectedCostItem, setSelectedCostItem] = useState<CostItem | null>(null)

  const rootNodes = useMemo(
    () => buildTree(costCodes, costItems),
    [costCodes, costItems]
  )

  const totalLow = useMemo(
    () => costItems.reduce((s, i) => s + (i.estimateLow ?? 0), 0),
    [costItems]
  )
  const totalHigh = useMemo(
    () => costItems.reduce((s, i) => s + (i.estimateHigh ?? 0), 0),
    [costItems]
  )
  const hasEstimates = totalLow > 0 || totalHigh > 0

  return (
    <div style={{ padding: 'var(--space-6) var(--space-7)' }}>
      <PageHeader title="Budget" />

      {/* Estimate summary card */}
      {hasEstimates && (
        <div
          style={{
            backgroundColor: 'var(--surface-primary)',
            boxShadow: 'var(--shadow-float)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Project Estimate Range
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(totalLow)} – {formatCurrency(totalHigh)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>
              {costItems.length} line items
            </div>
          </div>
        </div>
      )}

      {/* Cost code tree */}
      <div
        style={{
          backgroundColor: 'var(--surface-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        {rootNodes.map((node) => (
          <CostCodeGroup
            key={node.costCode.id}
            node={node}
            tradeTypes={tradeTypes}
            onSelectItem={setSelectedCostItem}
          />
        ))}
      </div>

      {/* Side panel */}
      <SidePanel
        open={selectedCostItem !== null}
        onClose={() => setSelectedCostItem(null)}
        title={selectedCostItem?.name ?? ''}
      >
        {selectedCostItem && (
          <CostItemDetail
            item={selectedCostItem}
            costCodes={costCodes}
            tradeTypes={tradeTypes}
          />
        )}
      </SidePanel>
    </div>
  )
}
