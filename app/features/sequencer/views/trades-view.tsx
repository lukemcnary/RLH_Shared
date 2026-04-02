// -------------------------------------------------------
// Trades View — trade-focused mobilization workspace
// -------------------------------------------------------

import { useState, useRef, useEffect, useMemo } from 'react'
import type {
  Gate,
  Mobilization,
  ProjectTrade,
  TradeType,
  SequenceMobilizationProjection,
  SequenceTradeProjection,
} from '@/types/database'
import { offsetToDate, formatDate } from '@/lib/mock-data'
import {
  elevatedCard,
  smallSecondaryBtn,
  accentPillBtn,
  surfaceCard,
} from '@/lib/theme/styles'

export interface TradesViewProps {
  projectTrades: ProjectTrade[]
  tradeTypes: TradeType[]
  gates: Gate[]
  activeTradeId: string | null
  tradeProjectionById: Map<string, SequenceTradeProjection>
  mobilizations: Mobilization[]
  startDate: string
  rawMobilizationById: Map<string, Mobilization>
  onTradeSelect: (tradeId: string | null) => void
  onAddTrade: (tradeTypeId: string) => void
  onAddMob: (gateId: string) => void
  onMobClick: (mob: SequenceMobilizationProjection | Mobilization) => void
}

export default function TradesView({
  projectTrades,
  tradeTypes,
  gates,
  activeTradeId,
  tradeProjectionById,
  mobilizations,
  startDate,
  rawMobilizationById,
  onTradeSelect,
  onAddTrade,
  onAddMob,
  onMobClick,
}: TradesViewProps) {
  const activeTrade = activeTradeId
    ? projectTrades.find(pt => pt.id === activeTradeId) ?? null
    : null

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Trade types not already on the project
  const availableTradeTypes = useMemo(() => {
    const usedIds = new Set(projectTrades.map(pt => pt.tradeType.id))
    return tradeTypes.filter(tt => !usedIds.has(tt.id))
  }, [projectTrades, tradeTypes])

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ margin: 16, ...elevatedCard, overflow: 'visible', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Panel header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              Trades
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Focused coordination workspace for trade-ready decisions and marker notes.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, position: 'relative' }} ref={dropdownRef}>
            <button
              style={smallSecondaryBtn}
              onClick={() => setDropdownOpen(prev => !prev)}
              disabled={availableTradeTypes.length === 0}
            >
              Add Trade
            </button>
            {dropdownOpen && availableTradeTypes.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                boxShadow: 'var(--shadow-float)',
                zIndex: 20,
                minWidth: 200,
                maxHeight: 280,
                overflowY: 'auto',
                padding: '4px 0',
              }}>
                {availableTradeTypes.map(tt => (
                  <button
                    key={tt.id}
                    onClick={() => {
                      onAddTrade(tt.id)
                      setDropdownOpen(false)
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 100ms ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {tt.name}
                    {tt.code ? <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>{tt.code}</span> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trade chip strip */}
        <div style={{
          overflowX: 'auto',
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--border-light)',
          padding: '12px 16px',
          flexShrink: 0,
        }}>
          {projectTrades.map(pt => {
            const tradeMobs = tradeProjectionById.get(pt.id)?.mobilizations ?? []
            const markerCount = tradeMobs.reduce((acc, m) => acc + m.markers.length, 0)
            const isActive = activeTradeId === pt.id
            return (
              <button
                key={pt.id}
                onClick={() => onTradeSelect(isActive ? null : pt.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: isActive ? 'var(--accent-light)' : 'var(--surface-elevated)',
                  cursor: 'pointer',
                  marginRight: 8,
                  flexShrink: 0,
                  minWidth: 140,
                  transition: 'all 150ms ease',
                  outline: isActive ? `2px solid var(--accent)` : 'none',
                  outlineOffset: -1,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                  {pt.tradeType.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block' }}>
                  PPP {tradeMobs.length}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'block' }}>
                  Markers {markerCount}
                </span>
              </button>
            )
          })}
        </div>

        {/* Gate buckets for selected trade */}
        {activeTrade ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {gates.map(gate => {
                const gateMobs = (tradeProjectionById.get(activeTrade.id)?.mobilizations ?? []).filter(
                  m => m.gateId === gate.id
                )
                return (
                  <TradeGateBucket
                    key={gate.id}
                    gate={gate}
                    mobs={gateMobs}
                    projectStartDate={startDate}
                    onAddMob={() => onAddMob(gate.id)}
                    onMobClick={mob => onMobClick(rawMobilizationById.get(mob.id) ?? mob)}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Select a trade above to view its mobilizations by gate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Trade gate bucket sub-component ───────────────────

interface TradeGateBucketProps {
  gate: Gate
  mobs: SequenceMobilizationProjection[]
  projectStartDate: string
  onAddMob: () => void
  onMobClick: (mob: SequenceMobilizationProjection) => void
}

function TradeGateBucket({ gate, mobs, projectStartDate, onAddMob, onMobClick }: TradeGateBucketProps) {
  return (
    <div style={surfaceCard}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: mobs.length > 0 ? '1px solid var(--border-light)' : 'none',
          background: 'var(--surface-muted)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {gate.name}
        </span>
        <button onClick={onAddMob} style={accentPillBtn}>
          + Mobilization
        </button>
      </div>

      {mobs.length > 0 && (
        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {mobs.map(mob => {
            const startD = offsetToDate(mob.resolvedStartOffset, projectStartDate)
            const endD   = offsetToDate(mob.resolvedEndOffset, projectStartDate)
            return (
              <div
                key={mob.id}
                onClick={() => onMobClick(mob)}
                className="hover-lift"
                style={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {mob.why || '(no intent set)'}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatDate(startD)} - {formatDate(endD)}
                  </span>
                </div>
                {mob.steps.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                    {mob.steps.length} scope step{mob.steps.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
