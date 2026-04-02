// -------------------------------------------------------
// Storyline View — alternating top/bottom card timeline
// -------------------------------------------------------

import type { RefObject } from 'react'
import type { Gate, Mobilization, SequencerUIState } from '@/types/database'
import { offsetToDate, formatDate } from '@/lib/mock-data'
import type { StorylineLayout, TimelineTick } from '../layout-engine'
import {
  HEADER_H,
  STORYLINE_CARD_W,
  STORYLINE_COLLAPSED_H,
  STORYLINE_EXPANDED_H,
  STORYLINE_ROW_H,
  STORYLINE_STEM_H,
} from '../sequencer-constants'
import {
  stickyTimelineHeader,
  tickContainer,
  tickMark,
  tickLabel,
  todayLine,
  weekBand,
  timelineCanvas,
  truncatedText,
  smallPill,
  smallActionBtn,
  accentActionBtn,
} from '@/lib/theme/styles'

export interface StorylineViewProps {
  scrollRef: RefObject<HTMLDivElement | null>
  storylineLayout: StorylineLayout
  overviewWeekTicks: TimelineTick[]
  storylineTimelineWidth: number
  todayOffset: number
  overviewLeadDays: number
  horizonDays: number
  pxPerDay: number
  startDate: string
  selectedMobilizationId: string | null
  gates: Gate[]
  rawMobilizationById: Map<string, Mobilization>
  onSelectMobilization: (mobilizationId: string | null) => void
  onEditMobilization: (mob: Mobilization) => void
  onNavigateToSequencing: (gateId: string) => void
}

export default function StorylineView({
  scrollRef,
  storylineLayout,
  overviewWeekTicks,
  storylineTimelineWidth,
  todayOffset,
  overviewLeadDays,
  horizonDays,
  pxPerDay,
  startDate,
  selectedMobilizationId,
  gates,
  rawMobilizationById,
  onSelectMobilization,
  onEditMobilization,
  onNavigateToSequencing,
}: StorylineViewProps) {
  const axisY = Math.max(240, storylineLayout.topRowCount * STORYLINE_ROW_H + 120)
  const storylineHeight = Math.max(
    620,
    axisY + storylineLayout.bottomRowCount * STORYLINE_ROW_H + STORYLINE_EXPANDED_H + 96,
  )

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        minHeight: 0,
        background: 'var(--background)',
      }}
    >
      <div style={{ minWidth: storylineTimelineWidth, minHeight: storylineHeight, ...timelineCanvas }}>
        {/* Week header */}
        <div style={{ height: HEADER_H, ...stickyTimelineHeader }}>
          <div style={tickContainer}>
            {overviewWeekTicks.map((tick, i) => (
              <div key={i} style={{ ...tickMark, left: tick.offset * pxPerDay }}>
                <span style={tickLabel}>{tick.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ position: 'relative', flex: 1, minHeight: storylineHeight }}>
          {/* Alternating week bands */}
          {overviewWeekTicks.map((tick, i) => (
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

          {/* Center axis */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: axisY,
              height: 2,
              background: 'var(--border)',
              pointerEvents: 'none',
            }}
          />

          {/* Today marker */}
          {todayOffset >= 0 && todayOffset <= horizonDays && (
            <div style={{ ...todayLine, left: (todayOffset + overviewLeadDays) * pxPerDay }} />
          )}

          {/* Storyline cards */}
          {storylineLayout.items.map(({ mobilization, band, row }, index) => {
            const isExpanded = selectedMobilizationId === mobilization.id
            const cardHeight = isExpanded ? STORYLINE_EXPANDED_H : STORYLINE_COLLAPSED_H
            const rowOffset = row * STORYLINE_ROW_H
            const cardLeft = (mobilization.resolvedStartOffset + overviewLeadDays) * pxPerDay
            const cardTop = band === 'top'
              ? axisY - STORYLINE_STEM_H - cardHeight - rowOffset
              : axisY + STORYLINE_STEM_H + rowOffset
            const spanLeft = (mobilization.resolvedStartOffset + overviewLeadDays) * pxPerDay
            const spanWidth = Math.max(16, mobilization.projectedDuration * pxPerDay)
            const stemLeft = cardLeft + Math.min(36, STORYLINE_CARD_W / 2)
            const rawMobilization = rawMobilizationById.get(mobilization.id) ?? mobilization
            const startD = offsetToDate(mobilization.resolvedStartOffset, startDate)
            const endD = offsetToDate(mobilization.resolvedEndOffset, startDate)
            const tradeColor = mobilization.tradeType.color ?? 'var(--accent)'
            const gateName = mobilization.gateId
              ? gates.find((gate) => gate.id === mobilization.gateId)?.name ?? 'Gate'
              : 'Gate'

            return (
              <div key={mobilization.id}>
                {/* Duration span on axis */}
                <div
                  style={{
                    position: 'absolute',
                    left: spanLeft,
                    top: axisY - 6,
                    width: spanWidth,
                    height: 12,
                    borderRadius: 999,
                    background: `${tradeColor}22`,
                    border: `1px solid ${tradeColor}55`,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />

                {/* Stem line */}
                <div
                  style={{
                    position: 'absolute',
                    left: stemLeft,
                    top: band === 'top' ? cardTop + cardHeight : axisY,
                    width: 1,
                    height: STORYLINE_STEM_H,
                    background: 'var(--border)',
                  }}
                />

                {/* Card */}
                <StorylineCard
                  tradeName={mobilization.tradeType.name}
                  gateName={gateName}
                  projectedDuration={mobilization.projectedDuration}
                  startDate={startD}
                  endDate={endD}
                  why={mobilization.why}
                  stepCount={mobilization.steps.length}
                  markerCount={mobilization.markers.length}
                  scopeCount={mobilization.scopes.length}
                  isExpanded={isExpanded}
                  cardLeft={cardLeft}
                  cardTop={cardTop}
                  cardHeight={cardHeight}
                  index={index}
                  onToggle={() => onSelectMobilization(
                    selectedMobilizationId === mobilization.id ? null : mobilization.id,
                  )}
                  onOpenDetails={() => onEditMobilization(rawMobilization)}
                  onOpenInSequencing={() => onNavigateToSequencing(mobilization.gateId)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Storyline card sub-component ──────────────────────

interface StorylineCardProps {
  tradeName: string
  gateName: string
  projectedDuration: number
  startDate: Date
  endDate: Date
  why: string
  stepCount: number
  markerCount: number
  scopeCount: number
  isExpanded: boolean
  cardLeft: number
  cardTop: number
  cardHeight: number
  index: number
  onToggle: () => void
  onOpenDetails: () => void
  onOpenInSequencing: () => void
}

function StorylineCard({
  tradeName,
  gateName,
  projectedDuration,
  startDate,
  endDate,
  why,
  stepCount,
  markerCount,
  scopeCount,
  isExpanded,
  cardLeft,
  cardTop,
  cardHeight,
  index,
  onToggle,
  onOpenDetails,
  onOpenInSequencing,
}: StorylineCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute',
        left: cardLeft,
        top: cardTop,
        width: STORYLINE_CARD_W,
        minHeight: cardHeight,
        borderRadius: 12,
        border: '1px solid var(--border-light)',
        background: 'var(--surface-elevated)',
        boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        padding: '10px 12px',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'inherit',
        overflow: 'hidden',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', ...truncatedText }}>
            {tradeName || `Mobilization ${index + 1}`}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, ...truncatedText }}>
            {gateName}
          </div>
        </div>
        <span style={smallPill}>
          {projectedDuration}d
        </span>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8, ...truncatedText }}>
        {formatDate(startDate)} - {formatDate(endDate)}
      </div>

      {isExpanded ? (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {why || 'No mobilization summary yet.'}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-tertiary)' }}>
            <span>{stepCount} steps</span>
            <span>{markerCount} markers</span>
            <span>{scopeCount} scopes</span>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onOpenDetails()
              }}
              style={smallActionBtn}
            >
              Open Details
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onOpenInSequencing()
              }}
              style={accentActionBtn}
            >
              Open In Sequencing
            </button>
          </div>
        </div>
      ) : null}
    </button>
  )
}
