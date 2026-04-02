'use client'

// -------------------------------------------------------
// SequencerBoard — Trevor's board layout with RangelineOS skin
//
// Architecture matches Trevor's exactly:
//  * Single scrollable viewport
//  * Gate label column is position:sticky left:0 inside same scroll
//  * "Sequencing" vs "Trades" are completely separate surfaces
//  * Mobilization cards are draggable and resizable (pixel-level)
//
// This is the top-level client component. It owns:
//  * all state (mobilizations, UI state, editing state)
//  * mutation handlers (create/update/delete via server actions)
//  * computed projections and layout memos
//
// View rendering is delegated to:
//  * views/project-view.tsx
//  * views/sequencing-view.tsx
//  * views/storyline-view.tsx
//  * views/trades-view.tsx
// -------------------------------------------------------

import { useState, useRef, useCallback, useEffect, useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ProjectExecutionData,
  SequencerData,
  Mobilization,
  Gate,
  SequencerUIState,
  SequenceProjection,
  UpdateGatePayload,
} from '@/types/database'
import { MobilizationModal } from './mobilization-modal'
import { buildSequence } from './sequence-engine'
import {
  createMobilization as createMobilizationAction,
  deleteMobilization as deleteMobilizationAction,
  updateGate as updateGateAction,
  updateMobilization as updateMobilizationAction,
} from './actions'
import { Button } from '@/components/button'
import { SidePanel } from '@/components/side-panel'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  PX_PER_DAY_DEFAULT,
  DEFAULT_HORIZON_DAYS,
  PROJECT_SCALE_RATIO,
  OVERVIEW_LEAD_MONTHS,
  SEQUENCING_LEAD_DAYS,
  EMPTY_GATE_ROW_H,
  ZOOM_MIN,
  ZOOM_MAX,
  ZOOM_STEP,
} from './sequencer-constants'
import {
  parseProjectDate,
  formatGateDateRange,
  computeGateRowData,
  computeWeekTicks,
  computeMonthTicks,
  computeMonthBands,
  computeMobNumbers,
  computeGateSummaries,
  computeStorylineLayout,
  getSequencingWeekStartOffset,
} from './layout-engine'
import { zoomBtnStyle, sectionLabel } from '@/lib/theme/styles'

import ProjectView from './views/project-view'
import SequencingView from './views/sequencing-view'
import StorylineView from './views/storyline-view'
import TradesView from './views/trades-view'

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

  // ── Timeline geometry ────────────────────────────────
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

  // ── Sync effects ────────────────────────────────────
  useEffect(() => {
    if (!gates.length) return
    setUi((current) => {
      if (current.activeGateId && gates.some((gate) => gate.id === current.activeGateId)) {
        return current
      }
      return { ...current, activeGateId: gates[0]?.id ?? null }
    })
  }, [gates])

  useEffect(() => { setMobilizations(initialMobs) }, [initialMobs])
  useEffect(() => { setGateDrafts(createGateDrafts(gates)) }, [gates])
  useEffect(() => {
    setUi((current) => current.mode === initialMode ? current : { ...current, mode: initialMode })
  }, [initialMode])

  // ── Computed projections ─────────────────────────────
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

  // ── Mutation helpers ─────────────────────────────────

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
        { onSuccess: () => { setEditingMob(null) } },
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
        onSuccess: () => { setEditingMob(null) },
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
      { onError: () => { setMobilizations(previous) } },
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
  const zoomIn  = () => setUi(u => ({ ...u, pxPerDay: Math.min(u.pxPerDay + ZOOM_STEP, ZOOM_MAX) }))
  const zoomOut = () => setUi(u => ({ ...u, pxPerDay: Math.max(u.pxPerDay - ZOOM_STEP, ZOOM_MIN) }))

  // ── Layout computations (memoized) ───────────────────

  const mobNumbers = useMemo(
    () => computeMobNumbers(currentProjection.mobilizations),
    [currentProjection.mobilizations],
  )

  function getMobNumber(mob: Mobilization): string {
    return mobNumbers.get(mob.id) ?? 'M?'
  }

  const sequencingWeekTicks = useMemo(
    () => computeWeekTicks(sequencingStartDate, sequencingRangeDays),
    [sequencingRangeDays, sequencingStartDate],
  )

  const overviewWeekTicks = useMemo(
    () => computeWeekTicks(overviewStartDate, overviewRangeDays),
    [overviewRangeDays, overviewStartDate],
  )

  const monthTicks = useMemo(
    () => computeMonthTicks(overviewStartDate, overviewRangeDays),
    [overviewRangeDays, overviewStartDate],
  )

  const projectMonthBands = useMemo(
    () => computeMonthBands(monthTicks, overviewRangeDays),
    [monthTicks, overviewRangeDays],
  )

  const gateRowData = useMemo(
    () => computeGateRowData(gates, gateProjectionById, ui.pxPerDay),
    [gates, gateProjectionById, ui.pxPerDay],
  )

  const projectGateSummaries = useMemo(
    () => computeGateSummaries(gates, gateProjectionById, startDate),
    [gateProjectionById, gates, startDate],
  )

  const storylineLayout = useMemo(
    () => computeStorylineLayout(currentProjection.mobilizations, ui.pxPerDay),
    [currentProjection.mobilizations, ui.pxPerDay],
  )

  // ── Sequencing scroll focus ──────────────────────────

  const getGateFocusOffset = useCallback((gateId: string | null) => {
    if (!gateId) return 0

    const gateProjection = gateProjectionById.get(gateId)
    const earliestMobilization = gateProjection?.mobilizations
      ? [...gateProjection.mobilizations].sort((a, b) => a.resolvedStartOffset - b.resolvedStartOffset)[0]
      : null

    if (earliestMobilization) {
      return getSequencingWeekStartOffset(earliestMobilization.resolvedStartOffset, sequencingStartDate, SEQUENCING_LEAD_DAYS)
    }

    const gate = gates.find((candidate) => candidate.id === gateId)
    if (!gate) return 0

    const gateStart = gate.declaredWindowStart ?? gate.workingWindowStart
    const gateStartOffset = gateStart ? Math.max(0, Math.round(
      ((parseProjectDate(gateStart)?.getTime() ?? 0) - (parseProjectDate(startDate)?.getTime() ?? 0)) / (1000 * 60 * 60 * 24)
    )) : 0
    return getSequencingWeekStartOffset(gateStartOffset, sequencingStartDate, SEQUENCING_LEAD_DAYS)
  }, [gateProjectionById, gates, sequencingStartDate, startDate])

  useEffect(() => {
    if (ui.mode !== 'sequencing' || !scrollRef.current) return
    const left = getGateFocusOffset(ui.activeGateId) * ui.pxPerDay
    scrollRef.current.scrollTo({ left, behavior: 'smooth' })
  }, [getGateFocusOffset, ui.activeGateId, ui.mode, ui.pxPerDay])

  // ── Derived active-gate state ────────────────────────

  const activeGate = gates.find((gate) => gate.id === ui.activeGateId) ?? gates[0] ?? null
  const detailsGate = detailsGateId ? gates.find((gate) => gate.id === detailsGateId) ?? null : null
  const activeGateData = activeGate
    ? (gateRowData.get(activeGate.id) ?? { rows: new Map(), mobs: [], rowHeight: EMPTY_GATE_ROW_H })
    : { rows: new Map<string, number>(), mobs: [] as import('@/types/database').SequenceMobilizationProjection[], rowHeight: EMPTY_GATE_ROW_H }
  const activeGateRowHeight = Math.max(activeGateData.rowHeight, 420)

  // ── Gate details panel ───────────────────────────────

  const renderGateDetailsPanel = (gate: Gate) => {
    const gateDraft = gateDrafts[gate.id] ?? {
      description: gate.description ?? '',
      lockStatus: gate.lockStatus,
    }
    const isGateLocked = gateDraft.lockStatus !== 'unlocked'

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
          <div style={sectionLabel}>Working Window</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {gate.workingWindowStart && gate.workingWindowEnd
              ? `${gate.workingWindowStart} \u2013 ${gate.workingWindowEnd}`
              : '\u2014'}
          </div>
          <div style={{ ...sectionLabel, marginTop: 8 }}>Declared Window</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {gate.declaredWindowStart && gate.declaredWindowEnd
              ? `${gate.declaredWindowStart} \u2013 ${gate.declaredWindowEnd}`
              : '\u2014'}
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

  // ── Trades view mob creation helper ──────────────────

  const handleTradesAddMob = useCallback((gateId: string) => {
    const activeTrade = activeTradeId
      ? projectTrades.find(pt => pt.id === activeTradeId) ?? null
      : null
    if (!activeTrade) return

    const lastMob = mobilizations
      .filter(m => m.gateId === gateId)
      .sort((a, b) => (b.startOffset + b.duration) - (a.startOffset + a.duration))[0]
    const mobStartOffset = lastMob ? lastMob.startOffset + lastMob.duration + 1 : 0
    const id = `mob-${Date.now()}`
    const newMob: Mobilization = {
      id,
      projectId: project.id,
      gateId,
      projectTradeId: activeTrade.id,
      tradeType: activeTrade.tradeType,
      why: '',
      status: 'draft',
      startOffset: mobStartOffset,
      duration: 5,
      displayOrder: getNextDisplayOrder(gateId),
      steps: [],
      markers: [],
    }
    setMobilizations(prev => [...prev, newMob])
    setEditingMob(newMob)
  }, [activeTradeId, getNextDisplayOrder, mobilizations, project.id, projectTrades])

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
              <button onClick={zoomOut} style={zoomBtnStyle} title="Zoom out">&minus;</button>
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

      {/* Surface — each view wrapped in an error boundary */}
      <ErrorBoundary>
        {ui.mode === 'project' ? (
          <ProjectView
            scrollRef={scrollRef}
            projectPxPerDay={projectPxPerDay}
            projectTimelineWidth={projectTimelineWidth}
            monthTicks={monthTicks}
            projectMonthBands={projectMonthBands}
            projectGateSummaries={projectGateSummaries}
            todayOffset={todayOffset}
            overviewLeadDays={overviewLeadDays}
            horizonDays={horizonDays}
            startDate={startDate}
            onNavigateToGate={(gateId) => setUi((current) => ({ ...current, mode: 'sequencing', activeGateId: gateId }))}
          />
        ) : ui.mode === 'sequencing' ? (
          <SequencingView
            scrollRef={scrollRef}
            gates={gates}
            activeGate={activeGate}
            activeGateData={activeGateData}
            activeGateRowHeight={activeGateRowHeight}
            projectGateSummaries={projectGateSummaries}
            sequencingWeekTicks={sequencingWeekTicks}
            sequencingTimelineWidth={sequencingTimelineWidth}
            todayOffset={todayOffset}
            sequencingRangeDays={sequencingRangeDays}
            pxPerDay={ui.pxPerDay}
            startDate={startDate}
            rawMobilizationById={rawMobilizationById}
            getMobNumber={getMobNumber}
            onGateSelect={(gateId) => setUi((current) => ({ ...current, activeGateId: gateId }))}
            onGateDetailsOpen={(gateId) => setDetailsGateId(gateId)}
            onMobClick={(mob) => setEditingMob(mob)}
            onUpdateMobilizationTimeline={updateMobilizationTimeline}
          />
        ) : ui.mode === 'storyline' ? (
          <StorylineView
            scrollRef={scrollRef}
            storylineLayout={storylineLayout}
            overviewWeekTicks={overviewWeekTicks}
            storylineTimelineWidth={storylineTimelineWidth}
            todayOffset={todayOffset}
            overviewLeadDays={overviewLeadDays}
            horizonDays={horizonDays}
            pxPerDay={ui.pxPerDay}
            startDate={startDate}
            selectedMobilizationId={ui.selectedMobilizationId}
            gates={gates}
            rawMobilizationById={rawMobilizationById}
            onSelectMobilization={(mobilizationId) => setUi((current) => ({ ...current, selectedMobilizationId: mobilizationId }))}
            onEditMobilization={(mob) => setEditingMob(mob)}
            onNavigateToSequencing={(gateId) => setUi((current) => ({ ...current, mode: 'sequencing', activeGateId: gateId }))}
          />
        ) : (
          <TradesView
            projectTrades={projectTrades}
            gates={gates}
            activeTradeId={activeTradeId}
            tradeProjectionById={tradeProjectionById}
            mobilizations={mobilizations}
            startDate={startDate}
            rawMobilizationById={rawMobilizationById}
            onTradeSelect={setActiveTradeId}
            onAddMob={handleTradesAddMob}
            onMobClick={(mob) => setEditingMob(rawMobilizationById.get(mob.id) ?? mob)}
          />
        )}
      </ErrorBoundary>

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
