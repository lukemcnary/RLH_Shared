// -------------------------------------------------------
// Sequencing View — gate-focused mobilization timeline
// -------------------------------------------------------

import type { RefObject } from 'react'
import type {
  Gate,
  Mobilization,
  SequenceMobilizationProjection,
  SequencerUIState,
} from '@/types/database'
import { MobilizationCard } from '../mobilization-card'
import { formatGateDateRange, type GateRowData, type GateSummary, type TimelineTick } from '../layout-engine'
import {
  HEADER_H,
  LANE_LABEL_W,
  LABEL_TOP_PAD,
  TIMELINE_ROW_H,
  SEQUENCING_LEAD_DAYS,
  EMPTY_GATE_ROW_H,
} from '../sequencer-constants'
import {
  stickyTimelineHeader,
  tickContainer,
  tickMark,
  tickLabel,
  todayLine,
  weekBand,
  scrollableViewport,
  timelineCanvas,
  uppercaseLabel,
} from '@/lib/theme/styles'

export interface SequencingViewProps {
  scrollRef: RefObject<HTMLDivElement | null>
  gates: Gate[]
  activeGate: Gate | null
  activeGateData: GateRowData
  activeGateRowHeight: number
  projectGateSummaries: GateSummary[]
  sequencingWeekTicks: TimelineTick[]
  sequencingTimelineWidth: number
  todayOffset: number
  sequencingRangeDays: number
  pxPerDay: number
  startDate: string
  rawMobilizationById: Map<string, Mobilization>
  getMobNumber: (mob: Mobilization) => string
  onGateSelect: (gateId: string) => void
  onGateDetailsOpen: (gateId: string) => void
  onMobClick: (mob: Mobilization) => void
  onUpdateMobilizationTimeline: (
    mobilizationId: string,
    timeline: { startOffset: number; duration: number; displayOrder: number },
  ) => void
}

export default function SequencingView({
  scrollRef,
  gates,
  activeGate,
  activeGateData,
  activeGateRowHeight,
  projectGateSummaries,
  sequencingWeekTicks,
  sequencingTimelineWidth,
  todayOffset,
  sequencingRangeDays,
  pxPerDay,
  startDate,
  rawMobilizationById,
  getMobNumber,
  onGateSelect,
  onGateDetailsOpen,
  onMobClick,
  onUpdateMobilizationTimeline,
}: SequencingViewProps) {
  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, background: 'var(--background)' }}>
      {/* Gate sidebar */}
      <div
        style={{
          width: LANE_LABEL_W,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border-light)',
          background: 'var(--surface-primary)',
          minHeight: 0,
        }}
      >
        <div
          style={{
            height: HEADER_H,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid var(--border-light)',
            flexShrink: 0,
          }}
        >
          <span style={uppercaseLabel}>Gates</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {gates.map((gate) => (
            <GateTile
              key={gate.id}
              gate={gate}
              isActive={activeGate?.id === gate.id}
              mobilizationCount={
                projectGateSummaries.find((s) => s.gate.id === gate.id)?.mobilizations.length ?? 0
              }
              onSelect={() => onGateSelect(gate.id)}
              onDetailsOpen={() => onGateDetailsOpen(gate.id)}
            />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div ref={scrollRef} style={scrollableViewport}>
        <div style={{ minWidth: sequencingTimelineWidth, ...timelineCanvas }}>
          {/* Week header */}
          <div style={{ height: HEADER_H, ...stickyTimelineHeader }}>
            <div style={tickContainer}>
              {sequencingWeekTicks.map((tick, i) => (
                <div key={i} style={{ ...tickMark, left: tick.offset * pxPerDay }}>
                  <span style={tickLabel}>{tick.label}</span>
                </div>
              ))}

              {/* Today marker in header */}
              {todayOffset + SEQUENCING_LEAD_DAYS >= 0 && todayOffset + SEQUENCING_LEAD_DAYS <= sequencingRangeDays && (
                <div
                  style={{
                    position: 'absolute',
                    left: (todayOffset + SEQUENCING_LEAD_DAYS) * pxPerDay,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'var(--accent-medium)',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          </div>

          {/* Mobilization canvas */}
          <div style={{ position: 'relative', flex: 1, minHeight: activeGateRowHeight }}>
            {/* Alternating week bands */}
            {sequencingWeekTicks.map((tick, i) => (
              i % 2 === 1 ? (
                <div
                  key={i}
                  style={{
                    ...weekBand,
                    left: tick.offset * pxPerDay,
                    width: 7 * pxPerDay,
                  }}
                />
              ) : null
            ))}

            {/* Today line */}
            {todayOffset + SEQUENCING_LEAD_DAYS >= 0 && todayOffset + SEQUENCING_LEAD_DAYS <= sequencingRangeDays && (
              <div
                style={{
                  ...todayLine,
                  left: (todayOffset + SEQUENCING_LEAD_DAYS) * pxPerDay,
                }}
              />
            )}

            {/* Mobilization cards */}
            {activeGateData.mobs.map((mob) => {
              const rawMobilization = rawMobilizationById.get(mob.id) ?? mob

              return (
                <MobilizationCard
                  key={mob.id}
                  mobilization={mob}
                  row={activeGateData.rows.get(mob.id) ?? Math.max(0, mob.displayOrder ?? 0)}
                  rowHeight={TIMELINE_ROW_H}
                  pxPerDay={pxPerDay}
                  timelineLeadDays={SEQUENCING_LEAD_DAYS}
                  projectStartDate={startDate}
                  mobNumber={getMobNumber(mob)}
                  labelTopPad={LABEL_TOP_PAD}
                  onClick={() => onMobClick(rawMobilization)}
                  onUpdateTimeline={(timeline) => onUpdateMobilizationTimeline(mob.id, timeline)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Gate tile sub-component ───────────────────────────

interface GateTileProps {
  gate: Gate
  isActive: boolean
  mobilizationCount: number
  onSelect: () => void
  onDetailsOpen: () => void
}

function GateTile({ gate, isActive, mobilizationCount, onSelect, onDetailsOpen }: GateTileProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        flex: 1,
        minHeight: 92,
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-light)',
        background: isActive ? 'var(--surface-elevated)' : 'var(--surface-primary)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {gate.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 5, lineHeight: 1.4 }}>
          {formatGateDateRange(gate)}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 6 }}>
          {mobilizationCount} mobilization{mobilizationCount === 1 ? '' : 's'}
        </div>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onDetailsOpen()
        }}
        style={{
          alignSelf: 'flex-start',
          fontSize: 11,
          fontWeight: 600,
          color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
          background: isActive ? 'var(--accent-light)' : 'var(--surface-muted)',
          border: `1px solid ${isActive ? 'var(--accent-medium)' : 'var(--border-light)'}`,
          borderRadius: 999,
          padding: '5px 10px',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Gate details
      </button>
    </div>
  )
}
