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

const PX_PER_DAY_DEFAULT = 18
const LANE_LABEL_W = 280
const ROW_MIN_H = 84
const LABEL_TOP_PAD = 36

interface SequencerBoardProps {
  data: SequencerData
  executionData: ProjectExecutionData
  projection: SequenceProjection
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

export function SequencerBoard({ data, executionData, projection }: SequencerBoardProps) {
  const { project, gates, mobilizations: initialMobs, projectTrades } = data
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [mobilizations, setMobilizations] = useState<Mobilization[]>(initialMobs)
  const [gateDrafts, setGateDrafts] = useState(() => createGateDrafts(gates))
  const [ui, setUi] = useState<SequencerUIState>({
    mode: 'sequencing',
    selectedMobilizationId: null,
    collapsedGates: {},
    pxPerDay: PX_PER_DAY_DEFAULT,
    horizonDays: 220,
  })
  const [editingMob, setEditingMob] = useState<Mobilization | null>(null)
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
    : 220
  const horizonDays = Math.max(ui.horizonDays, totalDays)
  const timelineWidth = horizonDays * ui.pxPerDay

  // Today offset
  const today = new Date()
  const projectStart = startDate ? new Date(startDate + 'T00:00:00') : new Date()
  const todayOffset = Math.round(
    (today.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Scroll to today on mount
  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = Math.max(0, (todayOffset - 7) * ui.pxPerDay - LANE_LABEL_W)
      scrollRef.current.scrollLeft = scrollTo
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setMobilizations(initialMobs)
  }, [initialMobs])

  useEffect(() => {
    setGateDrafts(createGateDrafts(gates))
  }, [gates])

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
      steps: [],
      markers: [],
    }
    setMobilizations(prev => [...prev, newMob])
    setEditingMob(newMob)
  }, [project.id])

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
    timeline: { startOffset: number; duration: number },
  ) => {
    const rawMobilization = rawMobilizationById.get(mobilizationId)
    if (!rawMobilization) return

    saveMobilization({
      ...rawMobilization,
      startOffset: timeline.startOffset,
      duration: timeline.duration,
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

  // ── Week tick marks (memoized) ──────────────────────
  const weekTicks = useMemo(() => {
    const ticks: { label: string; offset: number }[] = []
    let cursor = 0
    const day0 = startDate ? new Date(startDate + 'T00:00:00') : new Date()
    while (cursor <= horizonDays) {
      const dow = (day0.getDay() + cursor) % 7
      const daysUntilSunday = dow === 0 ? 0 : 7 - dow
      const weekStart = cursor + daysUntilSunday
      if (weekStart > horizonDays) break
      const d = new Date(day0)
      d.setDate(d.getDate() + weekStart)
      ticks.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        offset: weekStart,
      })
      cursor = weekStart + 7
    }
    return ticks
  }, [startDate, horizonDays])

  // ── Lane assignment (memoized per gate) ─────────────
  const assignLanesForMobs = useCallback((mobs: SequenceMobilizationProjection[]): Map<string, number> => {
    const result = new Map<string, number>()
    const lanes: [number, number][][] = []
    const gapDays = 10 / ui.pxPerDay

    const sorted = [...mobs].sort((a, b) => a.resolvedStartOffset - b.resolvedStartOffset)
    for (const mob of sorted) {
      const start = mob.resolvedStartOffset
      const end = mob.resolvedEndOffset
      let laneIdx = 0
      for (; laneIdx < lanes.length; laneIdx++) {
        const last = lanes[laneIdx][lanes[laneIdx].length - 1]
        if (start >= last[1] + gapDays) break
      }
      if (laneIdx === lanes.length) lanes.push([])
      lanes[laneIdx].push([start, end])
      result.set(mob.id, laneIdx)
    }
    return result
  }, [ui.pxPerDay])

  // Pre-compute lanes and row heights for all gates
  const gateLaneData = useMemo(() => {
    const result = new Map<string, { lanes: Map<string, number>; mobs: SequenceMobilizationProjection[]; rowHeight: number }>()
    for (const gate of gates) {
      const gateMobs = gateProjectionById.get(gate.id)?.mobilizations ?? []
      if (gateMobs.length === 0) {
        result.set(gate.id, { lanes: new Map(), mobs: gateMobs, rowHeight: ROW_MIN_H + LABEL_TOP_PAD })
      } else {
        const lanes = assignLanesForMobs(gateMobs)
        const maxLane = Math.max(...Array.from(lanes.values()), 0)
        const rowHeight = LABEL_TOP_PAD + (maxLane + 1) * 66 + 16
        result.set(gate.id, { lanes, mobs: gateMobs, rowHeight })
      }
    }
    return result
  }, [assignLanesForMobs, gateProjectionById, gates])

  const HEADER_H = 40

  // ─────────────────────────────────────────────────────
  // SEQUENCE VIEW
  // ─────────────────────────────────────────────────────

  const renderSequenceView = () => (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        background: 'var(--background)',
      }}
    >
      <div
        style={{
          minWidth: LANE_LABEL_W + timelineWidth,
          position: 'relative',
        }}
      >
        {/* Timeline header row */}
        <div
          style={{
            display: 'flex',
            height: HEADER_H,
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: 'var(--surface-primary)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {/* Gate column header */}
          <div
            style={{
              width: LANE_LABEL_W,
              flexShrink: 0,
              position: 'sticky',
              left: 0,
              zIndex: 30,
              background: 'var(--surface-primary)',
              borderRight: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
            }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
            }}>
              Gate
            </span>
          </div>

          {/* Week tick marks */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {weekTicks.map((tick, i) => (
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

            {/* Today marker */}
            {todayOffset >= 0 && todayOffset <= horizonDays && (
              <div
                style={{
                  position: 'absolute',
                  left: todayOffset * ui.pxPerDay,
                  top: 0, bottom: 0,
                  width: 2,
                  background: 'var(--accent-medium)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            )}
          </div>
        </div>

        {/* Gate rows */}
        {gates.map(gate => {
          const gateData = gateLaneData.get(gate.id) ?? { lanes: new Map(), mobs: [], rowHeight: ROW_MIN_H + LABEL_TOP_PAD }
          const { lanes, mobs: gateMobs, rowHeight: rowH } = gateData
          const gateDraft = gateDrafts[gate.id] ?? {
            description: gate.description ?? '',
            lockStatus: gate.lockStatus,
          }
          const isGateLocked = gateDraft.lockStatus !== 'unlocked'

          return (
            <div
              key={gate.id}
              style={{
                display: 'flex',
                height: rowH,
                borderBottom: '1px solid var(--border-light)',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* Gate label — sticky LEFT */}
              <div
                style={{
                  width: LANE_LABEL_W,
                  flexShrink: 0,
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  background: 'var(--surface-primary)',
                  borderRight: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '10px 12px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {gate.name}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>▼</span>
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
                  rows={3}
                  style={{
                    background: 'var(--surface-muted)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 4,
                    padding: '5px 7px',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    resize: 'none',
                    lineHeight: 1.5,
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                />

                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Working Window
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                    {gate.workingWindowStart && gate.workingWindowEnd
                      ? `${gate.workingWindowStart} – ${gate.workingWindowEnd}`
                      : '—'}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 5 }}>
                    Declared Window
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                    {gate.declaredWindowStart && gate.declaredWindowEnd
                      ? `${gate.declaredWindowStart} – ${gate.declaredWindowEnd}`
                      : '—'}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, cursor: 'pointer' }}>
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

              {/* Track area */}
              <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                {/* Week shading */}
                {weekTicks.map((tick, i) => (
                  i % 2 === 1 ? (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: 0, bottom: 0,
                        left: tick.offset * ui.pxPerDay,
                        width: 7 * ui.pxPerDay,
                        background: 'var(--grid-week)',
                        pointerEvents: 'none',
                      }}
                    />
                  ) : null
                ))}

                {/* Today line */}
                {todayOffset >= 0 && todayOffset <= horizonDays && (
                  <div
                    style={{
                      position: 'absolute',
                      left: todayOffset * ui.pxPerDay,
                      top: 0, bottom: 0,
                      width: 1,
                      background: 'var(--accent-light)',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Mob cards */}
                {gateMobs.map(mob => {
                  const rawMobilization = rawMobilizationById.get(mob.id) ?? mob

                  return (
                    <MobilizationCard
                      key={mob.id}
                      mobilization={mob}
                      lane={lanes.get(mob.id) ?? 0}
                      pxPerDay={ui.pxPerDay}
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
          )
        })}

        <div style={{ height: 60 }} />
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
            {project.name}
          </span>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 0, background: 'var(--surface-muted)', borderRadius: 6, padding: 2 }}>
            {(['sequencing', 'trades'] as const).map(mode => (
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
                {mode === 'sequencing' ? 'Sequencing' : 'Trades'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: zoom controls + add mobilization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {ui.mode === 'sequencing' && (
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
            onClick={() => createMobilization(gates[0]?.id ?? '', 0)}
            disabled={gates.length === 0 || isPending}
          >
            Add Mobilization
          </Button>
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '8px 16px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--surface-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-tertiary)' }}>
            <span>{currentProjection.totals.gateCount} gates</span>
            <span>{currentProjection.totals.tradeCount} trades</span>
            <span>{currentProjection.totals.mobilizationCount} mobilizations</span>
            <span>{currentProjection.totals.stepCount} scope steps</span>
            <span>{currentProjection.totals.markerCount} markers</span>
            <span>{currentProjection.totals.scopeCount} trade scopes</span>
          </div>
          <span style={{ fontSize: 11, color: errorMessage ? 'var(--danger)' : 'var(--text-tertiary)' }}>
            {errorMessage ?? statusMessage ?? (isPending ? 'Syncing live Dataverse changes...' : 'Live projection built from server data')}
          </span>
        </div>

        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)' }}>
            Execution Input
          </summary>
          <pre
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 6,
              border: '1px solid var(--border-light)',
              background: 'var(--surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 240,
            }}
          >
            {JSON.stringify(currentExecutionData, null, 2)}
          </pre>
        </details>

        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--text-secondary)' }}>
            Sequence Projection
          </summary>
          <pre
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 6,
              border: '1px solid var(--border-light)',
              background: 'var(--surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 240,
            }}
          >
            {JSON.stringify(currentProjection, null, 2)}
          </pre>
        </details>
      </div>

      {/* Surface */}
      {ui.mode === 'sequencing' ? renderSequenceView() : renderTradesView()}

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
