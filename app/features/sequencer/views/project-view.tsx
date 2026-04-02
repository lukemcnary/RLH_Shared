// -------------------------------------------------------
// Project View — high-level gate overview timeline
// -------------------------------------------------------

import type { RefObject } from 'react'
import type { Gate, SequencerUIState } from '@/types/database'
import { offsetToDate, formatDate } from '@/lib/mock-data'
import type { GateSummary, MonthBand, TimelineTick } from '../layout-engine'
import { HEADER_H } from '../sequencer-constants'
import {
  stickyTimelineHeader,
  tickContainer,
  tickMark,
  monthTickLabel,
  todayLine,
  scrollableViewport,
  timelineCanvas,
  durationPill,
  truncatedText,
} from '@/lib/theme/styles'

export interface ProjectViewProps {
  scrollRef: RefObject<HTMLDivElement | null>
  projectPxPerDay: number
  projectTimelineWidth: number
  monthTicks: TimelineTick[]
  projectMonthBands: MonthBand[]
  projectGateSummaries: GateSummary[]
  todayOffset: number
  overviewLeadDays: number
  horizonDays: number
  startDate: string
  onNavigateToGate: (gateId: string) => void
}

export default function ProjectView({
  scrollRef,
  projectPxPerDay,
  projectTimelineWidth,
  monthTicks,
  projectMonthBands,
  projectGateSummaries,
  todayOffset,
  overviewLeadDays,
  horizonDays,
  startDate,
  onNavigateToGate,
}: ProjectViewProps) {
  return (
    <div style={{ flex: 1, minHeight: 0, background: 'var(--background)' }}>
      <div
        ref={scrollRef}
        style={{
          width: '100%',
          ...scrollableViewport,
        }}
      >
        <div
          style={{
            minWidth: projectTimelineWidth,
            ...timelineCanvas,
          }}
        >
          {/* Month header */}
          <div style={{ height: HEADER_H, ...stickyTimelineHeader }}>
            <div style={tickContainer}>
              {monthTicks.map((tick, i) => (
                <div
                  key={i}
                  style={{ ...tickMark, left: tick.offset * projectPxPerDay, paddingLeft: 8 }}
                >
                  <span style={monthTickLabel}>{tick.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gate swim lanes */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              minHeight: Math.max(projectGateSummaries.length * 108, 560),
            }}
          >
            {/* Alternating month bands */}
            {projectMonthBands.map((band, i) => (
              band.width > 0 && i % 2 === 1 ? (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: band.offset * projectPxPerDay,
                    width: band.width * projectPxPerDay,
                    background: 'color-mix(in srgb, var(--surface-muted) 45%, transparent)',
                    pointerEvents: 'none',
                  }}
                />
              ) : null
            ))}

            {/* Today marker */}
            {todayOffset >= 0 && todayOffset <= horizonDays && (
              <div
                style={{
                  ...todayLine,
                  left: (todayOffset + overviewLeadDays) * projectPxPerDay,
                }}
              />
            )}

            {/* Gate bars */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
              {projectGateSummaries.map(({ gate, mobilizations, summaryStart, summaryDuration }, index) => {
                const barLeft = (summaryStart + overviewLeadDays) * projectPxPerDay
                const barWidth = Math.max(140, summaryDuration * projectPxPerDay)
                const rangeStart = offsetToDate(summaryStart, startDate)
                const rangeEnd = offsetToDate(summaryStart + summaryDuration, startDate)

                return (
                  <div
                    key={gate.id}
                    style={{
                      position: 'relative',
                      flex: 1,
                      minHeight: 102,
                      borderBottom: index === projectGateSummaries.length - 1 ? 'none' : '1px solid color-mix(in srgb, var(--border-light) 75%, transparent)',
                    }}
                  >
                    {/* Horizontal guide line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '50%',
                        borderTop: '1px solid color-mix(in srgb, var(--border-light) 85%, transparent)',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <GateBar
                      gate={gate}
                      barLeft={barLeft}
                      barWidth={barWidth}
                      summaryDuration={summaryDuration}
                      rangeStart={rangeStart}
                      rangeEnd={rangeEnd}
                      mobilizationCount={mobilizations.length}
                      onClick={() => onNavigateToGate(gate.id)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Gate bar sub-component ────────────────────────────

interface GateBarProps {
  gate: Gate
  barLeft: number
  barWidth: number
  summaryDuration: number
  rangeStart: Date
  rangeEnd: Date
  mobilizationCount: number
  onClick: () => void
}

function GateBar({
  gate,
  barLeft,
  barWidth,
  summaryDuration,
  rangeStart,
  rangeEnd,
  mobilizationCount,
  onClick,
}: GateBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        left: barLeft,
        top: '50%',
        transform: 'translateY(-50%)',
        width: barWidth,
        borderRadius: 16,
        border: '1px solid color-mix(in srgb, var(--accent) 22%, var(--border-light))',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-elevated) 94%, white), color-mix(in srgb, var(--accent) 8%, white))',
        boxShadow: 'var(--shadow-sm)',
        padding: '12px 14px',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', ...truncatedText }}>
          {gate.name}
        </span>
        <span style={durationPill}>
          {summaryDuration}d
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 8,
          flexWrap: 'wrap',
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        <span>{formatDate(rangeStart)} - {formatDate(rangeEnd)}</span>
        <span style={{ color: 'var(--text-tertiary)' }}>
          {mobilizationCount} mobilization{mobilizationCount === 1 ? '' : 's'}
        </span>
      </div>
    </button>
  )
}
