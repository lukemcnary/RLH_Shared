// -------------------------------------------------------
// Layout Engine — Row assignment and geometry helpers
//
// Pure functions for computing mobilization row positions,
// timeline ticks, storyline layouts, and gate summaries.
// No React, no state — just geometry.
// -------------------------------------------------------

import type {
  Gate,
  SequenceMobilizationProjection,
  SequenceGateProjection,
} from '@/types/database'
import {
  LABEL_TOP_PAD,
  TIMELINE_ROW_H,
  EMPTY_GATE_ROW_H,
  STORYLINE_CARD_W,
  STORYLINE_ROW_H,
} from './sequencer-constants'

// ─── Date helpers ──────────────────────────────────────

export function parseProjectDate(value?: string): Date | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function dateToProjectOffset(dateStr: string | undefined, projectStartDate: string): number {
  const date = parseProjectDate(dateStr)
  const projectStart = parseProjectDate(projectStartDate)
  if (!date || !projectStart) return 0

  return Math.max(
    0,
    Math.round((date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)),
  )
}

export function formatGateDateRange(gate: Gate): string {
  const start = gate.declaredWindowStart ?? gate.workingWindowStart
  const end = gate.declaredWindowEnd ?? gate.workingWindowEnd

  const startDate = parseProjectDate(start)
  const endDate = parseProjectDate(end)

  if (!startDate || !endDate) return 'No date window'

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
  })

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`
}

// ─── Row assignment ────────────────────────────────────

/**
 * Assign non-overlapping row indices to a set of mobilization projections.
 * Respects displayOrder as preferred rows, bumping to the next available
 * row when conflicts exist.
 */
export function assignRowsForMobs(
  mobs: SequenceMobilizationProjection[],
  pxPerDay: number,
): Map<string, number> {
  const result = new Map<string, number>()
  const rows: [number, number][][] = []
  const gapDays = 6 / pxPerDay

  const sorted = [...mobs].sort((a, b) => {
    const aPreferredRow = Math.max(0, a.displayOrder ?? 0)
    const bPreferredRow = Math.max(0, b.displayOrder ?? 0)

    if (aPreferredRow !== bPreferredRow) return aPreferredRow - bPreferredRow
    if (a.resolvedStartOffset !== b.resolvedStartOffset) {
      return a.resolvedStartOffset - b.resolvedStartOffset
    }
    if (a.resolvedEndOffset !== b.resolvedEndOffset) {
      return a.resolvedEndOffset - b.resolvedEndOffset
    }
    return a.id.localeCompare(b.id)
  })

  for (const mob of sorted) {
    const start = mob.resolvedStartOffset
    const end = mob.resolvedEndOffset
    let rowIdx = Math.max(0, mob.displayOrder ?? 0)

    while (true) {
      const rowIntervals = rows[rowIdx] ?? []
      const hasConflict = rowIntervals.some(([existingStart, existingEnd]) => (
        start < existingEnd + gapDays && existingStart < end + gapDays
      ))

      if (!hasConflict) break
      rowIdx += 1
    }

    if (!rows[rowIdx]) rows[rowIdx] = []
    rows[rowIdx].push([start, end])
    result.set(mob.id, rowIdx)
  }

  return result
}

// ─── Gate row data ─────────────────────────────────────

export interface GateRowData {
  rows: Map<string, number>
  mobs: SequenceMobilizationProjection[]
  rowHeight: number
}

/**
 * Pre-compute row assignments and total height for each gate.
 */
export function computeGateRowData(
  gates: Gate[],
  gateProjectionById: Map<string, SequenceGateProjection>,
  pxPerDay: number,
): Map<string, GateRowData> {
  const result = new Map<string, GateRowData>()
  for (const gate of gates) {
    const gateMobs = gateProjectionById.get(gate.id)?.mobilizations ?? []
    if (gateMobs.length === 0) {
      result.set(gate.id, { rows: new Map(), mobs: gateMobs, rowHeight: EMPTY_GATE_ROW_H })
    } else {
      const rows = assignRowsForMobs(gateMobs, pxPerDay)
      const maxRow = Math.max(...Array.from(rows.values()), 0)
      const rowHeight = LABEL_TOP_PAD + (maxRow + 1) * TIMELINE_ROW_H + 24
      result.set(gate.id, { rows, mobs: gateMobs, rowHeight })
    }
  }
  return result
}

// ─── Timeline tick generators ──────────────────────────

export interface TimelineTick {
  label: string
  offset: number
}

/**
 * Generate week-aligned tick marks for a timeline starting at `day0`.
 */
export function computeWeekTicks(day0: Date, rangeDays: number): TimelineTick[] {
  const ticks: TimelineTick[] = []
  let cursor = 0
  while (cursor <= rangeDays) {
    const dow = (day0.getDay() + cursor) % 7
    const daysUntilSunday = dow === 0 ? 0 : 7 - dow
    const weekStart = cursor + daysUntilSunday
    if (weekStart > rangeDays) break
    const d = new Date(day0)
    d.setDate(d.getDate() + weekStart)
    ticks.push({
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      offset: weekStart,
    })
    cursor = weekStart + 7
  }
  return ticks
}

export interface MonthTick extends TimelineTick {}

/**
 * Generate month-boundary tick marks for a timeline starting at `startDate`.
 */
export function computeMonthTicks(startDate: Date, rangeDays: number): MonthTick[] {
  const ticks: MonthTick[] = []
  const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  ticks.push({
    label: startDate.toLocaleDateString('en-US', { month: 'short' }),
    offset: 0,
  })

  let cursor = new Date(monthStart)
  cursor.setMonth(cursor.getMonth() + 1)

  while (true) {
    const offset = Math.round(
      (cursor.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (offset > rangeDays) break

    ticks.push({
      label: cursor.toLocaleDateString('en-US', { month: 'short' }),
      offset: Math.max(0, offset),
    })

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  return ticks
}

export interface MonthBand extends TimelineTick {
  width: number
}

/**
 * Convert month ticks into bands with widths for alternating-shade rendering.
 */
export function computeMonthBands(monthTicks: MonthTick[], rangeDays: number): MonthBand[] {
  return monthTicks.map((tick, index) => {
    const nextOffset = monthTicks[index + 1]?.offset ?? rangeDays
    return {
      ...tick,
      width: Math.max(0, nextOffset - tick.offset),
    }
  })
}

// ─── M-number assignment ───────────────────────────────

/**
 * Pre-compute human-readable mobilization numbers (M1, M2, ...) per trade.
 */
export function computeMobNumbers(
  mobilizations: SequenceMobilizationProjection[],
): Map<string, string> {
  const byTrade = new Map<string, SequenceMobilizationProjection[]>()
  for (const m of mobilizations) {
    if (!m.tradeType.id) continue
    const arr = byTrade.get(m.tradeType.id) ?? []
    arr.push(m)
    byTrade.set(m.tradeType.id, arr)
  }
  const result = new Map<string, string>()
  for (const [, mobs] of byTrade) {
    mobs.sort((a, b) => a.resolvedStartOffset - b.resolvedStartOffset)
    mobs.forEach((m, i) => result.set(m.id, `M${i + 1}`))
  }
  return result
}

// ─── Gate summary for project overview ─────────────────

export interface GateSummary {
  gate: Gate
  mobilizations: SequenceMobilizationProjection[]
  summaryStart: number
  summaryEnd: number
  summaryDuration: number
}

/**
 * Compute gate summary data for the project overview timeline.
 */
export function computeGateSummaries(
  gates: Gate[],
  gateProjectionById: Map<string, SequenceGateProjection>,
  startDate: string,
): GateSummary[] {
  return gates.map((gate) => {
    const gateMobs = gateProjectionById.get(gate.id)?.mobilizations ?? []
    const summaryStart = gateMobs.length > 0
      ? Math.min(...gateMobs.map((mobilization) => mobilization.resolvedStartOffset))
      : dateToProjectOffset(gate.declaredWindowStart ?? gate.workingWindowStart, startDate)
    const summaryEnd = gateMobs.length > 0
      ? Math.max(...gateMobs.map((mobilization) => mobilization.resolvedEndOffset))
      : Math.max(
          summaryStart + 1,
          dateToProjectOffset(gate.declaredWindowEnd ?? gate.workingWindowEnd, startDate),
        )
    const summaryDuration = Math.max(1, summaryEnd - summaryStart)

    return {
      gate,
      mobilizations: gateMobs,
      summaryStart,
      summaryEnd,
      summaryDuration,
    }
  })
}

// ─── Storyline layout ──────────────────────────────────

export interface StorylineItem {
  mobilization: SequenceMobilizationProjection
  band: 'top' | 'bottom'
  row: number
}

export interface StorylineLayout {
  items: StorylineItem[]
  topRowCount: number
  bottomRowCount: number
}

/**
 * Compute the alternating top/bottom band layout for the storyline view.
 */
export function computeStorylineLayout(
  mobilizations: SequenceMobilizationProjection[],
  pxPerDay: number,
): StorylineLayout {
  const cardWidthDays = STORYLINE_CARD_W / pxPerDay
  const topRows: [number, number][][] = []
  const bottomRows: [number, number][][] = []

  const items = [...mobilizations]
    .sort((a, b) => {
      if (a.resolvedStartOffset !== b.resolvedStartOffset) {
        return a.resolvedStartOffset - b.resolvedStartOffset
      }
      if (a.resolvedEndOffset !== b.resolvedEndOffset) {
        return a.resolvedEndOffset - b.resolvedEndOffset
      }
      return a.id.localeCompare(b.id)
    })
    .map((mobilization, index) => {
      const band: 'top' | 'bottom' = index % 2 === 0 ? 'top' : 'bottom'
      const rows = band === 'top' ? topRows : bottomRows
      const start = mobilization.resolvedStartOffset
      const end = Math.max(
        mobilization.resolvedEndOffset,
        mobilization.resolvedStartOffset + cardWidthDays,
      )

      let row = 0
      while (true) {
        const intervals = rows[row] ?? []
        const hasConflict = intervals.some(([existingStart, existingEnd]) => (
          start < existingEnd && existingStart < end
        ))
        if (!hasConflict) break
        row += 1
      }

      if (!rows[row]) rows[row] = []
      rows[row].push([start, end])

      return { mobilization, band, row }
    })

  return {
    items,
    topRowCount: topRows.length,
    bottomRowCount: bottomRows.length,
  }
}

// ─── Sequencing scroll helpers ─────────────────────────

export function getSequencingWeekStartOffset(
  projectOffset: number,
  sequencingStartDate: Date,
  leadDays: number,
): number {
  const timelineOffset = Math.max(0, projectOffset + leadDays)
  const targetDate = new Date(sequencingStartDate)
  targetDate.setDate(targetDate.getDate() + timelineOffset)

  const weekStartDate = new Date(targetDate)
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay())

  return Math.max(
    0,
    Math.round((weekStartDate.getTime() - sequencingStartDate.getTime()) / (1000 * 60 * 60 * 24)),
  )
}
