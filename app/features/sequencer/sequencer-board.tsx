'use client'

// -------------------------------------------------------
// SequencerBoard — Trevor's board layout with RangelineOS skin
//
// Architecture matches Trevor's exactly:
//  • Single scrollable viewport
//  • Gate label column is position:sticky left:0 inside same scroll
//  • "Sequencing" vs "Trades" are completely separate surfaces
//  • Mobilization cards are draggable and resizable (pixel-level)
// -------------------------------------------------------

import { useState, useRef, useCallback, useEffect, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ProjectExecutionData,
  SequencerData,
  Mobilization,
  SequenceMobilizationProjection,
  Gate,
  SequencerUIState,
  SequenceProjection,
  UpdateGatePayload,
} from '@/types/database'
import { offsetToDate, formatDate } from '@/lib/mock-data'
import { MobilizationCard } from './mobilization-card'
import { buildSequence } from './sequence-engine'
import { MobilizationModal } from './mobilization-modal'
import {
  createMobilization as createMobilizationAction,
  deleteMobilization as deleteMobilizationAction,
  updateGate as updateGateAction,
  updateMobilization as updateMobilizationAction,
} from './actions'
import { Button } from '@/components/button'
import { SidePanel } from '@/components/side-panel'

const PX_PER_DAY_DEFAULT = 18
const DEFAULT_HORIZON_DAYS = 365 * 3
const PROJECT_SCALE_RATIO = 7 / 30
const OVERVIEW_LEAD_MONTHS = 3
const SEQUENCING_LEAD_DAYS = 30
const LANE_LABEL_W = 196
const LABEL_TOP_PAD = 76
const TIMELINE_ROW_H = 92
const EMPTY_GATE_ROW_H = LABEL_TOP_PAD + TIMELINE_ROW_H + 24
const STORYLINE_CARD_W = 220
const STORYLINE_COLLAPSED_H = 54
const STORYLINE_EXPANDED_H = 136
const STORYLINE_ROW_H = 118
const STORYLINE_STEM_H = 28

interface SequencerBoardProps {
  data: SequencerData
  executionData: ProjectExecutionData
  projection: SequenceProjection
  initialMode?: SequencerUIState['mode']
  showModeTabs?: boolean
  pageTitle?: string
}

function createGateDrafts(gates: Gate[]) {
  return Object.fromEntries(
    gates.map((gate) => [
      gate.id,
      {
        description: gate.description ?? '',
        lockStatus: gate.lockStatus,
      },
    ]),
  )
}

function parseProjectDate(value?: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateToProjectOffset(dateStr: string | undefined, projectStartDate: string) {
  const date = parseProjectDate(dateStr)
  const projectStart = parseProjectDate(projectStartDate)
  if (!date || !projectStart) return 0

  return Math.max(
    0,
    Math.round((date.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)),
  )
}

function formatGateDateRange(gate: Gate) {
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

export function SequencerBoard({
  data,
  executionData,
  projection,
  initialMode = 'sequencing',
  showModeTabs = true,
  pageTitle = 'Sequencer',
}: SequencerBoardProps) {
  const { project, gates, mobilizations: initialMobs, projectTrades } = data
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [mobilizations, setMobilizations] = useState<Mobilization[]>(initialMobs)
  const [gateDrafts, setGateDrafts] = useState(() => createGateDrafts(gates))
  const [ui, setUi] = useState<SequencerUIState>({
    mode: initialMode,
    selectedMobilizationId: null,
    activeGateId: gates[0]?.id ?? null,
    pxPerDay: PX_PER_DAY_DEFAULT,
    horizonDays: DEFAULT_HORIZON_DAYS,
  })
  const [editingMob, setEditingMob] = useState<Mobilization | null>(null)
  const [detailsGateId, setDetailsGateId] = useState<string | null>(null)
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Timeline geometry
  const startDate = project.startDate ?? ''
  const totalDays = project.completionDate && startDate
    ? Math.round(
        (new Date(project.completionDate + 'T00:00:00').getTime() -
          new Date(startDate + 'T00:00:00').getTime()) /
          (1000 * 60 * 60 * 24)
  ) + 30
    : DEFAULT_HORIZON_DAYS
  const horizonDays = Math.max(ui.horizonDays, totalDays)
  const sequencingRangeDays = horizonDays + SEQUENCING_LEAD_DAYS
  const sequencingTimelineWidth = sequencingRangeDays * ui.pxPerDay
  const projectPxPerDay = Math.max(3.5, ui.pxPerDay * PROJECT_SCALE_RATIO)

  const sequencingStartDate = useMemo(() => {
    const baseDate = parseProjectDate(startDate) ?? new Date()
    const sequenceDate = new Date(baseDate)
    sequenceDate.setDate(sequenceDate.getDate() - SEQUENCING_LEAD_DAYS)
    return sequenceDate
  }, [startDate])

  const overviewStartDate = useMemo(() => {
    const baseDate = parseProjectDate(startDate) ?? new Date()
    const overviewDate = new Date(baseDate)
    overviewDate.setMonth(overviewDate.getMonth() - OVERVIEW_LEAD_MONTHS)
    return overviewDate
  }, [startDate])

  const overviewLeadDays = useMemo(() => {
    const baseDate = parseProjectDate(startDate) ?? new Date()
    return Math.max(
      0,
      Math.round((baseDate.getTime() - overviewStartDate.getTime()) / (1000 * 60 * 60 * 24)),
    )
  }, [overviewStartDate, startDate])

  const overviewRangeDays = horizonDays + overviewLeadDays
  const projectTimelineWidth = overviewRangeDays * projectPxPerDay
  const storylineTimelineWidth = overviewRangeDays * ui.pxPerDay

  // Today offset
  const today = new Date()
  const projectStart = startDate ? new Date(startDate + 'T00:00:00') : new Date()
  const todayOffset = Math.round(
    (today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  useEffect(() => {
    if (!gates.length) return

    setUi((current) => {
      if (current.activeGateId && gates.some((gate) => gate.id === current.activeGateId)) {
        return current
      }

      return {
        ...current,
        activeGateId: gates[0]?.id ?? null,
      }
    })
  }, [gates])

  useEffect(() => {
    setMobilizations(initialMobs)
  }, [initialMobs])

  useEffect(() => {
    setGateDrafts(createGateDrafts(gates))
  }, [gates])

  useEffect(() => {
    setUi((current) => current.mode === initialMode ? current : { ...current, mode: initialMode })
  }, [initialMode])

  const currentExecutionData = useMemo<ProjectExecutionData>(() => ({
    ...executionData,
    mobilizations,
  }), [executionData, mobilizations])

  const currentProjection = useMemo(
    () => (mobilizations === initialMobs ? projection : buildSequence(currentExecutionData)),
    [currentExecutionData, initialMobs, mobilizations, projection],
  )

  const rawMobilizationById = useMemo(
    () => new Map(mobilizations.map((mobilization) => [mobilization.id, mobilization])),
    [mobilizations],
  )

  const gateProjectionById = useMemo(
    () => new Map(currentProjection.gates.map((gateProjection) => [gateProjection.gate.id, gateProjection])),
    [currentProjection],
  )

  const tradeProjectionById = useMemo(
    () => new Map(currentProjection.trades.map((tradeProjection) => [tradeProjection.projectTrade.id, tradeProjection])),
    [currentProjection],
  )

  const getNextDisplayOrder = useCallback((gateId: string) => {
    const gateRows = mobilizations
      .filter((mobilization) => mobilization.gateId === gateId)
      .map((mobilization) => mobilization.displayOrder ?? 0)

    return gateRows.length > 0 ? Math.max(...gateRows) + 1 : 0
  }, [mobilizations])

  // ── Mutation helpers ──────────────────────────────────

  const createMobilization = useCallback((gateId: string, startOffset: number) => {
    const id = `mob-${Date.now()}`
    const newMob: Mobilization = {
      id,
      projectId: project.id,
      gateId,
      projectTradeId: '',
      tradeType: { id: '', name: '', code: '' },
      why: '',
      status: 'draft',
      startOffset: Math.max(0, startOffset),
      duration: 5,
      displayOrder: getNextDisplayOrder(gateId),
      steps: [],
      markers: [],
    }
    setMobilizations(prev => [...prev, newMob])
    setEditingMob(newMob)
  }, [getNextDisplayOrder, project.id])

  const runMutation = useCallback((
    label: string,
    work: () => Promise<{ ok: boolean; error?: string }>,
    options?: { onSuccess?: () => void; onError?: () => void },
  ) => {
    setErrorMessage(null)
    setStatusMessage(label)

    startTransition(() => {
      void (async () => {
        try {
          const result = await work()

          if (!result.ok) {
            options?.onError?.()
            setErrorMessage(result.error ?? `${label} failed`)
            setStatusMessage(null)
            router.refresh()
            return
          }

          options?.onSuccess?.()
          setStatusMessage(null)
          router.refresh()
        } catch (error) {
          options?.onError?.()
          setErrorMessage(error instanceof Error ? error.message : String(error))
          setStatusMessage(null)
          router.refresh()
        }
      })()
    })
  }, [router])

  const saveMobilization = useCallback((updated: Mobilization) => {
    const persisted = initialMobs.some((mobilization) => mobilization.id === updated.id)

    if (!persisted) {
      runMutation(
        'Saving mobilization to Dataverse...',
        () => createMobilizationAction({
          projectId: updated.projectId,
          gateId: updated.gateId,
          projectTradeId: updated.projectTradeId,
          why: updated.why,
          startOffset: updated.startOffset,
          duration: updated.duration,
          displayOrder: updated.displayOrder,
          steps: updated.steps.map((step, index) => ({
            ...step,
            sortOrder: step.sortOrder ?? index + 1,
          })),
          markers: updated.markers,
        }),
        {
          onSuccess: () => {
            setEditingMob(null)
          },
        },
      )
      return
    }

    const previous = mobilizations.find((mobilization) => mobilization.id === updated.id)
    setMobilizations((current) => current.map((mobilization) => (
      mobilization.id === updated.id ? updated : mobilization
    )))
    setEditingMob((current) => current?.id === updated.id ? updated : current)

    runMutation(
      'Updating mobilization in Dataverse...',
      () => updateMobilizationAction({
        id: updated.id,
        gateId: updated.gateId,
        projectTradeId: updated.projectTradeId,
        why: updated.why,
        startOffset: updated.startOffset,
        duration: updated.duration,
        displayOrder: updated.displayOrder,
        steps: updated.steps.map((step, index) => ({
          ...step,
          sortOrder: step.sortOrder ?? index + 1,
        })),
        markers: updated.markers,
      }, project.id),
      {
        onSuccess: () => {
          setEditingMob(null)
        },
        onError: () => {
          if (!previous) return
          setMobilizations((current) => current.map((mobilization) => (
            mobilization.id === previous.id ? previous : mobilization
          )))
          setEditingMob((current) => current?.id === previous.id ? previous : current)
        },
      },
    )
  }, [initialMobs, mobilizations, project.id, runMutation])

  const updateMobilizationTimeline = useCallback((
    mobilizationId: string,
    timeline: { startOffset: number; duration: number; displayOrder: number },
  ) => {
    const rawMobilization = rawMobilizationById.get(mobilizationId)
    if (!rawMobilization) return

    saveMobilization({
      ...rawMobilization,
      startOffset: timeline.startOffset,
      duration: timeline.duration,
      displayOrder: timeline.displayOrder,
    })
  }, [rawMobilizationById, saveMobilization])

  const deleteMobilization = useCallback((mobId: string) => {
    const previous = mobilizations
    const existing = initialMobs.some((mobilization) => mobilization.id === mobId)
    setMobilizations((current) => current.filter((mobilization) => mobilization.id !== mobId))
    setEditingMob(null)

    if (!existing) return

    runMutation(
      'Deleting mobilization from Dataverse...',
      () => deleteMobilizationAction(mobId, project.id),
      {
        onError: () => {
          setMobilizations(previous)
        },
      },
    )
  }, [initialMobs, mobilizations, project.id, runMutation])

  const saveGate = useCallback((payload: UpdateGatePayload) => {
    const gate = gates.find((candidate) => candidate.id === payload.id)
    if (!gate) return

    const previous = {
      description: gate.description ?? '',
      lockStatus: gate.lockStatus,
    }

    runMutation(
      'Saving gate to Dataverse...',
      () => updateGateAction(payload, project.id),
      {
        onError: () => {
          setGateDrafts((current) => ({
            ...current,
            [payload.id]: previous,
          }))
        },
      },
    )
  }, [gates, project.id, runMutation])

  // ── Zoom ─────────────────────────────────────────────

  const zoomIn  = () => setUi(u => ({ ...u, pxPerDay: Math.min(u.pxPerDay + 4, 56) }))
  const zoomOut = () => setUi(u => ({ ...u, pxPerDay: Math.max(u.pxPerDay - 4, 8) }))

  // ── M-number assignment (pre-computed map) ──────────
  const mobNumbers = useMemo(() => {
    const byTrade = new Map<string, SequenceMobilizationProjection[]>()
    for (const m of currentProjection.mobilizations) {
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
  }, [currentProjection.mobilizations])

  function getMobNumber(mob: Mobilization): string {
    return mobNumbers.get(mob.id) ?? 'M?'
  }

  const sequencingWeekTicks = useMemo(() => {
    const ticks: { label: string; offset: number }[] = []
    let cursor = 0
    const day0 = sequencingStartDate
    while (cursor <= sequencingRangeDays) {
      const dow = (day0.getDay() + cursor) % 7
      const daysUntilSunday = dow === 0 ? 0 : 7 - dow
      const weekStart = cursor + daysUntilSunday
      if (weekStart > sequencingRangeDays) break
      const d = new Date(day0)
      d.setDate(d.getDate() + weekStart)
      ticks.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        offset: weekStart,
      })
      cursor = weekStart + 7
    }
    return ticks
  }, [sequencingRangeDays, sequencingStartDate])

  const overviewWeekTicks = useMemo(() => {
    const ticks: { label: string; offset: number }[] = []
    let cursor = 0
    const day0 = overviewStartDate
    while (cursor <= overviewRangeDays) {
      const dow = (day0.getDay() + cursor) % 7
      const daysUntilSunday = dow === 0 ? 0 : 7 - dow
      const weekStart = cursor + daysUntilSunday
      if (weekStart > overviewRangeDays) break
      const d = new Date(day0)
      d.setDate(d.getDate() + weekStart)
      ticks.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        offset: weekStart,
      })
      cursor = weekStart + 7
    }
    return ticks
  }, [overviewRangeDays, overviewStartDate])

  const monthTicks = useMemo(() => {
    const ticks: { label: string; offset: number }[] = []
    const projectStartDate = overviewStartDate
    const monthStart = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), 1)

    ticks.push({
      label: projectStartDate.toLocaleDateString('en-US', { month: 'short' }),
      offset: 0,
    })

    let cursor = new Date(monthStart)
    cursor.setMonth(cursor.getMonth() + 1)

    while (true) {
      const offset = Math.round(
        (cursor.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (offset > overviewRangeDays) break

      ticks.push({
        label: cursor.toLocaleDateString('en-US', { month: 'short' }),
        offset: Math.max(0, offset),
      })

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
    }

    return ticks
  }, [overviewRangeDays, overviewStartDate])

  const projectMonthBands = useMemo(() => (
    monthTicks.map((tick, index) => {
      const nextOffset = monthTicks[index + 1]?.offset ?? overviewRangeDays
      return {
        ...tick,
        width: Math.max(0, nextOffset - tick.offset),
      }
    })
  ), [monthTicks, overviewRangeDays])

  // ── Row assignment (memoized per gate) ──────────────
  const assignRowsForMobs = useCallback((mobs: SequenceMobilizationProjection[]): Map<string, number> => {
    const result = new Map<string, number>()
    const rows: [number, number][][] = []
    const gapDays = 6 / ui.pxPerDay

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
  }, [ui.pxPerDay])

  // Pre-compute rows and row heights for all gates
  const gateRowData = useMemo(() => {
    const result = new Map<string, { rows: Map<string, number>; mobs: SequenceMobilizationProjection[]; rowHeight: number }>()
    for (const gate of gates) {
      const gateMobs = gateProjectionById.get(gate.id)?.mobilizations ?? []
      if (gateMobs.length === 0) {
        result.set(gate.id, { rows: new Map(), mobs: gateMobs, rowHeight: EMPTY_GATE_ROW_H })
      } else {
        const rows = assignRowsForMobs(gateMobs)
        const maxRow = Math.max(...Array.from(rows.values()), 0)
        const rowHeight = LABEL_TOP_PAD + (maxRow + 1) * TIMELINE_ROW_H + 24
        result.set(gate.id, { rows, mobs: gateMobs, rowHeight })
      }
    }
    return result
  }, [assignRowsForMobs, gateProjectionById, gates])

  const HEADER_H = 40
  const activeGate = gates.find((gate) => gate.id === ui.activeGateId) ?? gates[0] ?? null
  const detailsGate = detailsGateId ? gates.find((gate) => gate.id === detailsGateId) ?? null : null
  const activeGateData = activeGate
    ? (gateRowData.get(activeGate.id) ?? { rows: new Map(), mobs: [], rowHeight: EMPTY_GATE_ROW_H })
    : { rows: new Map<string, number>(), mobs: [] as SequenceMobilizationProjection[], rowHeight: EMPTY_GATE_ROW_H }
  const activeGateRowHeight = Math.max(activeGateData.rowHeight, 420)
  const renderGateDetailsPanel = (gate: Gate) => {
    const gateDraft = gateDrafts[gate.id] ?? {
      description: gate.description ?? '',
      lockStatus: gate.lockStatus,
    }
    const isGateLocked = gateDraft.lockStatus !== 'unlocked'

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {gate.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            {formatGateDateRange(gate)}
          </div>
        </div>

        <textarea
          value={gateDraft.description}
          onChange={(event) => {
            const description = event.target.value
            setGateDrafts((current) => ({
              ...current,
              [gate.id]: {
                ...(current[gate.id] ?? { description: gate.description ?? '', lockStatus: gate.lockStatus }),
                description,
              },
            }))
          }}
          onBlur={() => {
            if (gateDraft.description === (gate.description ?? '')) return
            saveGate({ id: gate.id, description: gateDraft.description })
          }}
          placeholder="Describe the intent and completion condition of this gate..."
          rows={4}
          style={{
            background: 'var(--surface-muted)',
            border: '1px solid var(--border-light)',
            borderRadius: 4,
            padding: '7px 8px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            resize: 'none',
            lineHeight: 1.5,
            outline: 'none',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Working Window
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {gate.workingWindowStart && gate.workingWindowEnd
              ? `${gate.workingWindowStart} – ${gate.workingWindowEnd}`
              : '—'}
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 8 }}>
            Declared Window
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {gate.declaredWindowStart && gate.declaredWindowEnd
              ? `${gate.declaredWindowStart} – ${gate.declaredWindowEnd}`
              : '—'}
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isGateLocked}
            onChange={(event) => {
              const lockStatus = event.target.checked ? 'soft_lock' : 'unlocked'
              setGateDrafts((current) => ({
                ...current,
                [gate.id]: {
                  ...(current[gate.id] ?? { description: gate.description ?? '', lockStatus: gate.lockStatus }),
                  lockStatus,
                },
              }))
              if (lockStatus !== gate.lockStatus) {
                saveGate({ id: gate.id, lockStatus })
              }
            }}
            style={{ margin: 0 }}
          />
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Lock gate dates</span>
        </label>
      </div>
    )
  }

  const renderGateTile = (gate: Gate) => {
    const isActive = activeGate?.id === gate.id
    const gateSummary = projectGateSummaries.find((summary) => summary.gate.id === gate.id)

    return (
      <div
        key={gate.id}
        onClick={() => setUi((current) => ({ ...current, activeGateId: gate.id }))}
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
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginTop: 5,
              lineHeight: 1.4,
            }}
          >
            {formatGateDateRange(gate)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 6 }}>
            {gateSummary?.mobilizations.length ?? 0} mobilization{(gateSummary?.mobilizations.length ?? 0) === 1 ? '' : 's'}
          </div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            setDetailsGateId(gate.id)
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

  const projectGateSummaries = useMemo(() => (
    gates.map((gate) => {
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
  ), [gateProjectionById, gates, startDate])

  const getSequencingWeekStartOffset = useCallback((projectOffset: number) => {
    const timelineOffset = Math.max(0, projectOffset + SEQUENCING_LEAD_DAYS)
    const targetDate = new Date(sequencingStartDate)
    targetDate.setDate(targetDate.getDate() + timelineOffset)

    const weekStartDate = new Date(targetDate)
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay())

    return Math.max(
      0,
      Math.round((weekStartDate.getTime() - sequencingStartDate.getTime()) / (1000 * 60 * 60 * 24)),
    )
  }, [sequencingStartDate])

  const getGateFocusOffset = useCallback((gateId: string | null) => {
    if (!gateId) return 0

    const gateProjection = gateProjectionById.get(gateId)
    const earliestMobilization = gateProjection?.mobilizations
      ? [...gateProjection.mobilizations].sort((a, b) => a.resolvedStartOffset - b.resolvedStartOffset)[0]
      : null

    if (earliestMobilization) {
      return getSequencingWeekStartOffset(earliestMobilization.resolvedStartOffset)
    }

    const gate = gates.find((candidate) => candidate.id === gateId)
    if (!gate) return 0

    return Math.max(
      0,
      getSequencingWeekStartOffset(
        dateToProjectOffset(gate.declaredWindowStart ?? gate.workingWindowStart, startDate),
      ),
    )
  }, [gateProjectionById, gates, getSequencingWeekStartOffset, startDate])

  useEffect(() => {
    if (ui.mode !== 'sequencing' || !scrollRef.current) return

    const left = getGateFocusOffset(ui.activeGateId) * ui.pxPerDay
    scrollRef.current.scrollTo({ left, behavior: 'smooth' })
  }, [getGateFocusOffset, ui.activeGateId, ui.mode, ui.pxPerDay])

  const storylineLayout = useMemo(() => {
    const cardWidthDays = STORYLINE_CARD_W / ui.pxPerDay
    const topRows: [number, number][][] = []
    const bottomRows: [number, number][][] = []

    const items = [...currentProjection.mobilizations]
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
        const band = index % 2 === 0 ? 'top' : 'bottom'
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

        return {
          mobilization,
          band,
          row,
        }
      })

    return {
      items,
      topRowCount: topRows.length,
      bottomRowCount: bottomRows.length,
    }
  }, [currentProjection.mobilizations, ui.pxPerDay])

  const renderProjectView = () => (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        background: 'var(--background)',
      }}
    >
      <div
        ref={scrollRef}
        style={{
          width: '100%',
          overflow: 'auto',
          position: 'relative',
          minHeight: 0,
          background: 'var(--background)',
        }}
      >
        <div
          style={{
            minWidth: projectTimelineWidth,
            minHeight: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: HEADER_H,
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: 'var(--surface-primary)',
              borderBottom: '1px solid var(--border-light)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              {monthTicks.map((tick, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: tick.offset * projectPxPerDay,
                    top: 0,
                    bottom: 0,
                    borderLeft: '1px solid var(--grid-line)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 8,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {tick.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              flex: 1,
              minHeight: Math.max(projectGateSummaries.length * 108, 560),
            }}
          >
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

            {todayOffset >= 0 && todayOffset <= horizonDays && (
              <div
                style={{
                  position: 'absolute',
                  left: (todayOffset + overviewLeadDays) * projectPxPerDay,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'var(--accent-light)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
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

                    <button
                      type="button"
                      onClick={() => setUi((current) => ({ ...current, mode: 'sequencing', activeGateId: gate.id }))}
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
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {gate.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            background: 'var(--surface-primary)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 999,
                            padding: '4px 8px',
                            flexShrink: 0,
                          }}
                        >
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
                          {mobilizations.length} mobilization{mobilizations.length === 1 ? '' : 's'}
                        </span>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStorylineView = () => {
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
        <div
          style={{
            minWidth: storylineTimelineWidth,
            minHeight: storylineHeight,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: HEADER_H,
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: 'var(--surface-primary)',
              borderBottom: '1px solid var(--border-light)',
              flexShrink: 0,
            }}
          >
            <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              {overviewWeekTicks.map((tick, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: tick.offset * ui.pxPerDay,
                    top: 0,
                    bottom: 0,
                    borderLeft: '1px solid var(--grid-line)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 5,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {tick.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', flex: 1, minHeight: storylineHeight }}>
            {overviewWeekTicks.map((tick, i) => (
              i % 2 === 1 ? (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: tick.offset * ui.pxPerDay,
                    width: 7 * ui.pxPerDay,
                    background: 'var(--grid-week)',
                    pointerEvents: 'none',
                  }}
                />
              ) : null
            ))}

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

            {todayOffset >= 0 && todayOffset <= horizonDays && (
              <div
                style={{
                  position: 'absolute',
                  left: (todayOffset + overviewLeadDays) * ui.pxPerDay,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'var(--accent-light)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            )}

            {storylineLayout.items.map(({ mobilization, band, row }, index) => {
              const isExpanded = ui.selectedMobilizationId === mobilization.id
              const cardHeight = isExpanded ? STORYLINE_EXPANDED_H : STORYLINE_COLLAPSED_H
              const rowOffset = row * STORYLINE_ROW_H
              const cardLeft = (mobilization.resolvedStartOffset + overviewLeadDays) * ui.pxPerDay
              const cardTop = band === 'top'
                ? axisY - STORYLINE_STEM_H - cardHeight - rowOffset
                : axisY + STORYLINE_STEM_H + rowOffset
              const spanLeft = (mobilization.resolvedStartOffset + overviewLeadDays) * ui.pxPerDay
              const spanWidth = Math.max(16, mobilization.projectedDuration * ui.pxPerDay)
              const stemLeft = cardLeft + Math.min(36, STORYLINE_CARD_W / 2)
              const rawMobilization = rawMobilizationById.get(mobilization.id) ?? mobilization
              const startD = offsetToDate(mobilization.resolvedStartOffset, startDate)
              const endD = offsetToDate(mobilization.resolvedEndOffset, startDate)
              const tradeColor = mobilization.tradeType.color ?? 'var(--accent)'

              return (
                <div key={mobilization.id}>
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

                  <button
                    type="button"
                    onClick={() => setUi((current) => ({
                      ...current,
                      selectedMobilizationId: current.selectedMobilizationId === mobilization.id ? null : mobilization.id,
                    }))}
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
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mobilization.tradeType.name || `Mobilization ${index + 1}`}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--text-tertiary)',
                            marginTop: 4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mobilization.gateId
                            ? gates.find((gate) => gate.id === mobilization.gateId)?.name ?? 'Gate'
                            : 'Gate'}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-secondary)',
                          flexShrink: 0,
                          background: 'var(--surface-muted)',
                          borderRadius: 999,
                          padding: '3px 7px',
                        }}
                      >
                        {mobilization.projectedDuration}d
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        marginTop: 8,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(startD)} - {formatDate(endD)}
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
                          {mobilization.why || 'No mobilization summary yet.'}
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', fontSize: 10, color: 'var(--text-tertiary)' }}>
                          <span>{mobilization.steps.length} steps</span>
                          <span>{mobilization.markers.length} markers</span>
                          <span>{mobilization.scopes.length} scopes</span>
                        </div>

                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setEditingMob(rawMobilization)
                            }}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--border)',
                              background: 'var(--surface-primary)',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Open Details
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setUi((current) => ({
                                ...current,
                                mode: 'sequencing',
                                activeGateId: mobilization.gateId,
                              }))
                            }}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid var(--accent-medium)',
                              background: 'var(--accent-light)',
                              color: 'var(--accent)',
                              cursor: 'pointer',
                              fontFamily: 'inherit',
                            }}
                          >
                            Open In Sequencing
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────
  // SEQUENCE VIEW
  // ─────────────────────────────────────────────────────

  const renderSequenceView = () => (
    <div
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        background: 'var(--background)',
      }}
    >
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
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
          }}>
            Gates
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
          }}
        >
          {gates.map((gate) => renderGateTile(gate))}
        </div>
      </div>

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
        <div
          style={{
            minWidth: sequencingTimelineWidth,
            minHeight: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              height: HEADER_H,
              position: 'sticky',
              top: 0,
              zIndex: 20,
              background: 'var(--surface-primary)',
              borderBottom: '1px solid var(--border-light)',
              flexShrink: 0,
            }}
          >
            {/* Week tick marks */}
            <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
              {sequencingWeekTicks.map((tick, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: tick.offset * ui.pxPerDay,
                    top: 0,
                    bottom: 0,
                    borderLeft: '1px solid var(--grid-line)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 5,
                  }}
                >
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {tick.label}
                  </span>
                </div>
              ))}

              {todayOffset + SEQUENCING_LEAD_DAYS >= 0 && todayOffset + SEQUENCING_LEAD_DAYS <= sequencingRangeDays && (
                <div
                  style={{
                    position: 'absolute',
                    left: (todayOffset + SEQUENCING_LEAD_DAYS) * ui.pxPerDay,
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

          <div
            style={{
              position: 'relative',
              flex: 1,
              minHeight: activeGateRowHeight,
            }}
          >
            {sequencingWeekTicks.map((tick, i) => (
              i % 2 === 1 ? (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: tick.offset * ui.pxPerDay,
                    width: 7 * ui.pxPerDay,
                    background: 'var(--grid-week)',
                    pointerEvents: 'none',
                  }}
                />
              ) : null
            ))}

            {todayOffset + SEQUENCING_LEAD_DAYS >= 0 && todayOffset + SEQUENCING_LEAD_DAYS <= sequencingRangeDays && (
              <div
                style={{
                  position: 'absolute',
                  left: (todayOffset + SEQUENCING_LEAD_DAYS) * ui.pxPerDay,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'var(--accent-light)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            )}

            {activeGateData.mobs.map((mob) => {
              const rawMobilization = rawMobilizationById.get(mob.id) ?? mob

              return (
                <MobilizationCard
                  key={mob.id}
                  mobilization={mob}
                  row={activeGateData.rows.get(mob.id) ?? Math.max(0, mob.displayOrder ?? 0)}
                  rowHeight={TIMELINE_ROW_H}
                  pxPerDay={ui.pxPerDay}
                  timelineLeadDays={SEQUENCING_LEAD_DAYS}
                  projectStartDate={startDate}
                  mobNumber={getMobNumber(mob)}
                  labelTopPad={LABEL_TOP_PAD}
                  onClick={() => setEditingMob(rawMobilization)}
                  onUpdateTimeline={(timeline) => updateMobilizationTimeline(mob.id, timeline)}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────
  // TRADES VIEW
  // ─────────────────────────────────────────────────────

  const renderTradesView = () => {
    const activeTrade = activeTradeId
      ? projectTrades.find(pt => pt.id === activeTradeId) ?? null
      : null

    return (
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          margin: 16,
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: 'var(--shadow-sm)',
        }}>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={smallSecondaryBtn}>Add Trade</button>
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
                  onClick={() => setActiveTradeId(isActive ? null : pt.id)}
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
                      onAddMob={() => {
                        const lastMob = mobilizations
                          .filter(m => m.gateId === gate.id)
                          .sort((a, b) => (b.startOffset + b.duration) - (a.startOffset + a.duration))[0]
                        const mobStartOffset = lastMob ? lastMob.startOffset + lastMob.duration + 1 : 0
                        const id = `mob-${Date.now()}`
                        const newMob: Mobilization = {
                          id,
                          projectId: project.id,
                          gateId: gate.id,
                          projectTradeId: activeTrade.id,
                          tradeType: activeTrade.tradeType,
                          why: '',
                          status: 'draft',
                          startOffset: mobStartOffset,
                          duration: 5,
                          displayOrder: getNextDisplayOrder(gate.id),
                          steps: [],
                          markers: [],
                        }
                        setMobilizations(prev => [...prev, newMob])
                        setEditingMob(newMob)
                      }}
                      onMobClick={mob => setEditingMob(rawMobilizationById.get(mob.id) ?? mob)}
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

  const smallSecondaryBtn: React.CSSProperties = {
    fontSize: 12,
    padding: '5px 12px',
    borderRadius: 5,
    border: '1px solid var(--border)',
    background: 'var(--surface-elevated)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  const transientMessage = errorMessage ?? statusMessage ?? (isPending ? 'Syncing changes...' : null)

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Toolbar */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 48,
          padding: '0 16px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface-primary)',
          gap: 12,
        }}
      >
        {/* Left: project name + mode tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            {pageTitle}
          </span>

          {showModeTabs ? (
            <div style={{ display: 'flex', gap: 0, background: 'var(--surface-muted)', borderRadius: 6, padding: 2 }}>
              {(['project', 'sequencing', 'storyline'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setUi(u => ({ ...u, mode }))}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '4px 12px',
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    background: ui.mode === mode ? 'var(--surface-elevated)' : 'transparent',
                    color: ui.mode === mode ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: ui.mode === mode ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 150ms ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {mode === 'project'
                    ? 'Project'
                    : mode === 'sequencing'
                      ? 'Sequencing'
                      : 'Storyline'}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right: zoom controls + add mobilization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {ui.mode !== 'trades' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={zoomOut} style={zoomBtnStyle} title="Zoom out">−</button>
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', minWidth: 28, textAlign: 'center' }}>
                {ui.pxPerDay}px
              </span>
              <button onClick={zoomIn} style={zoomBtnStyle} title="Zoom in">+</button>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => createMobilization(ui.activeGateId ?? gates[0]?.id ?? '', 0)}
            disabled={gates.length === 0 || !activeGate || isPending}
          >
            Add Mobilization
          </Button>
        </div>
      </div>

      {transientMessage ? (
        <div
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderBottom: '1px solid var(--border-light)',
            background: errorMessage ? 'color-mix(in srgb, var(--danger) 8%, white)' : 'var(--surface-muted)',
          }}
        >
          <span style={{ fontSize: 11, color: errorMessage ? 'var(--danger)' : 'var(--text-tertiary)' }}>
            {transientMessage}
          </span>
        </div>
      ) : null}

      {/* Surface */}
      {ui.mode === 'project'
        ? renderProjectView()
        : ui.mode === 'sequencing'
          ? renderSequenceView()
          : ui.mode === 'storyline'
            ? renderStorylineView()
            : renderTradesView()}

      <SidePanel
        open={Boolean(detailsGate)}
        onClose={() => setDetailsGateId(null)}
        title={detailsGate?.name ?? 'Gate details'}
      >
        {detailsGate ? renderGateDetailsPanel(detailsGate) : null}
      </SidePanel>

      {/* Modal */}
      {editingMob && (
        <MobilizationModal
          mobilization={editingMob}
          projectTrades={projectTrades}
          gates={gates}
          projectStartDate={startDate}
          isSaving={isPending}
          onSave={saveMobilization}
          onDelete={() => deleteMobilization(editingMob.id)}
          onClose={() => { if (!isPending) setEditingMob(null) }}
        />
      )}
    </div>
  )
}

// -------------------------------------------------------
// Trade gate bucket (Trades view)
// -------------------------------------------------------

interface TradeGateBucketProps {
  gate: Gate
  mobs: SequenceMobilizationProjection[]
  projectStartDate: string
  onAddMob: () => void
  onMobClick: (mob: SequenceMobilizationProjection) => void
}

function TradeGateBucket({ gate, mobs, projectStartDate, onAddMob, onMobClick }: TradeGateBucketProps) {
  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-light)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
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
        <button
          onClick={onAddMob}
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--accent)',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-medium)',
            borderRadius: 5,
            padding: '3px 9px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
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
                    {formatDate(startD)} – {formatDate(endD)}
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

// -------------------------------------------------------
// Shared zoom button style
// -------------------------------------------------------

const zoomBtnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border)',
  borderRadius: 4,
  background: 'var(--surface-elevated)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
  fontFamily: 'inherit',
}
