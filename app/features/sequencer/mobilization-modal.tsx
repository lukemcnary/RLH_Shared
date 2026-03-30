'use client'

// -------------------------------------------------------
// MobilizationModal — Trevor's structure, RangelineOS skin
// -------------------------------------------------------

import { useState, useEffect } from 'react'
import type { Mobilization, ProjectTrade, Gate, TradeItem, MobilizationMarker } from '@/types/database'
import { offsetToDate } from '@/lib/mock-data'

interface MobilizationModalProps {
  mobilization: Mobilization
  projectTrades: ProjectTrade[]
  gates: Gate[]
  projectStartDate: string
  onSave: (updated: Mobilization) => void
  onDelete: () => void
  onClose: () => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function MobilizationModal({
  mobilization,
  projectTrades,
  gates,
  projectStartDate,
  onSave,
  onDelete,
  onClose,
}: MobilizationModalProps) {
  const [projectTradeId, setProjectTradeId] = useState(mobilization.projectTradeId || '')
  const [gateId, setGateId]                 = useState(mobilization.gateId)
  const [startOffset, setStartOffset]       = useState(mobilization.startOffset)
  const [duration, setDuration]             = useState(mobilization.duration)
  const [why, setWhy]                       = useState(mobilization.why)
  const [steps, setSteps]                   = useState<TradeItem[]>(mobilization.steps)
  const [markers, setMarkers]               = useState<MobilizationMarker[]>(mobilization.markers)
  const [confirmDelete, setConfirmDelete]   = useState(false)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const startDate = offsetToDate(startOffset, projectStartDate)
  const endDate   = offsetToDate(startOffset + duration, projectStartDate)

  const dateToOffset = (dateStr: string) => {
    const d    = new Date(dateStr + 'T00:00:00')
    const base = new Date(projectStartDate + 'T00:00:00')
    return Math.round((d.getTime() - base.getTime()) / (1000 * 60 * 60 * 24))
  }

  // ── Save ─────────────────────────────────────────────
  const handleSave = () => {
    const selectedTrade = projectTrades.find(pt => pt.id === projectTradeId)
    const tradeType = selectedTrade?.tradeType ?? mobilization.tradeType
    onSave({
      ...mobilization,
      projectTradeId,
      tradeType,
      gateId,
      startOffset,
      duration: Math.max(1, duration),
      why,
      steps,
      markers,
    })
  }

  // ── Steps ─────────────────────────────────────────────
  const addStep = () => setSteps(prev => [
    ...prev,
    { id: uid(), mobilizationId: mobilization.id, name: '', notes: '', sortOrder: prev.length + 1 },
  ])
  const updateStep = (id: string, field: 'name' | 'notes', val: string) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  const removeStep = (id: string) =>
    setSteps(prev => prev.filter(s => s.id !== id))

  // ── Markers ──────────────────────────────────────────
  const addMarker = () => setMarkers(prev => [
    ...prev,
    { id: uid(), mobilizationId: mobilization.id, label: 'New checkpoint', notes: '', position: 0.5 },
  ])
  const updateMarker = (id: string, field: 'label' | 'notes' | 'position', val: string | number) =>
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m))
  const removeMarker = (id: string) =>
    setMarkers(prev => prev.filter(m => m.id !== id))

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26, 26, 26, 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 720,
        maxHeight: '92vh',
        background: 'var(--surface-elevated)',
        borderRadius: 8,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
            Trade Mobilization
          </span>

          <select
            value={projectTradeId}
            onChange={e => setProjectTradeId(e.target.value)}
            className="select-styled"
            style={{
              flex: 1,
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              borderRadius: 5, padding: '6px 32px 6px 10px',
              fontSize: 13, color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          >
            <option value="">Select Trade</option>
            {projectTrades.map(pt => (
              <option key={pt.id} value={pt.id}>
                {pt.tradeType.name}{pt.company?.name ? ` — ${pt.company.name}` : ''}
              </option>
            ))}
          </select>

          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              padding: '5px 14px', borderRadius: 5,
              border: '1px solid var(--border)',
              background: 'var(--surface-muted)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              flexShrink: 0, fontFamily: 'inherit',
            }}
          >
            Close
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* WHY / INTENT */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={sectionHeadStyle}>WHY / INTENT (BUILDER REASONING)</div>
            <textarea
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="Why this mobilization exists, what it protects, what the next trade needs, key coordination points..."
              rows={4}
              style={{
                width: '100%', marginTop: 8,
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 5, padding: '10px 12px',
                fontSize: 13, color: 'var(--text-primary)',
                fontFamily: 'inherit',
                resize: 'vertical', lineHeight: 1.6,
                outline: 'none',
              }}
            />
          </div>

          {/* Timing band */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-light)',
            background: 'var(--surface-muted)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr 1fr 1fr auto',
              gap: 16, alignItems: 'start',
            }}>
              {/* Gate */}
              <div>
                <div style={timingLabelStyle}>Gate</div>
                <select value={gateId} onChange={e => setGateId(e.target.value)} style={timingInputStyle}>
                  {gates.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <div style={timingLabelStyle}>Duration (Work Days)</div>
                <input
                  type="number" min={1}
                  value={duration}
                  onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ ...timingInputStyle, width: '100%' }}
                />
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                  Total: <strong>{duration} Days</strong>
                </div>
              </div>

              {/* Start date */}
              <div>
                <div style={timingLabelStyle}>Start Date</div>
                <input
                  type="date"
                  value={startDate.toISOString().slice(0, 10)}
                  onChange={e => setStartOffset(Math.max(0, dateToOffset(e.target.value)))}
                  style={{ ...timingInputStyle, width: '100%' }}
                />
              </div>

              {/* End date */}
              <div>
                <div style={timingLabelStyle}>End Date</div>
                <input
                  type="date"
                  value={endDate.toISOString().slice(0, 10)}
                  onChange={e => {
                    const newEnd = dateToOffset(e.target.value)
                    setDuration(Math.max(1, newEnd - startOffset))
                  }}
                  style={{ ...timingInputStyle, width: '100%' }}
                />
              </div>

              {/* Mob ID */}
              <div>
                <div style={timingLabelStyle}>Mob ID</div>
                <div style={{ ...timingInputStyle, color: 'var(--text-tertiary)', minWidth: 60 }}>
                  {mobilization.id ? mobilization.id.slice(-6).toUpperCase() : '?'}
                </div>
              </div>
            </div>
          </div>

          {/* SCOPE section */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={sectionHeadStyle}>Scope</div>
              <button onClick={addStep} style={addBtnStyle}>Add Scope</button>
            </div>
            {steps.length === 0 ? (
              <p style={emptyTextStyle}>No scope defined yet. Add to mark what this mobilization covers.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {steps.map((step, idx) => (
                  <div key={step.id} style={itemCardStyle}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', paddingTop: 8, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {idx + 1}.
                      </span>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text" value={step.name}
                          onChange={e => updateStep(step.id, 'name', e.target.value)}
                          placeholder="Scope item..."
                          style={{ ...itemInputStyle, width: '100%', marginBottom: 4 }}
                        />
                        <textarea
                          value={step.notes ?? ''}
                          onChange={e => updateStep(step.id, 'notes', e.target.value)}
                          placeholder="Notes..."
                          rows={2}
                          style={{ ...itemInputStyle, width: '100%', resize: 'none' }}
                        />
                      </div>
                      <button onClick={() => removeStep(step.id)} style={removeBtn}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MARKERS section */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
              <div>
                <div style={sectionHeadStyle}>Internal Markers</div>
                <p style={{ ...emptyTextStyle, marginTop: 2 }}>
                  Inspections, coordination points, handoff needs.
                </p>
              </div>
              <button onClick={addMarker} style={{ ...addBtnStyle, marginLeft: 12, flexShrink: 0 }}>Add Marker</button>
            </div>
            {markers.length === 0 ? (
              <p style={emptyTextStyle}>No markers yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {markers.map(marker => (
                  <div key={marker.id} style={itemCardStyle}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', flexShrink: 0, marginTop: 9 }} />
                      <div style={{ flex: 1 }}>
                        <input
                          type="text" value={marker.label}
                          onChange={e => updateMarker(marker.id, 'label', e.target.value)}
                          placeholder="Marker label..."
                          style={{ ...itemInputStyle, width: '100%', marginBottom: 4 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>Position:</span>
                          <input
                            type="range" min={0} max={1} step={0.05}
                            value={marker.position}
                            onChange={e => updateMarker(marker.id, 'position', parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 32, fontVariantNumeric: 'tabular-nums' }}>
                            {Math.round(marker.position * 100)}%
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeMarker(marker.id)} style={removeBtn}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px',
          borderTop: '1px solid var(--border-light)',
          flexShrink: 0,
          background: 'var(--surface-elevated)',
        }}>
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--danger)' }}>Delete this mobilization?</span>
              <button onClick={onDelete} style={footerDangerBtn}>Yes, delete</button>
              <button onClick={() => setConfirmDelete(false)} style={footerSecondaryBtn}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={footerDangerBtn}>
              Delete Mobilization
            </button>
          )}

          <button
            onClick={handleSave}
            style={{
              ...footerPrimaryBtn,
              opacity: !projectTradeId ? 0.5 : 1,
              cursor: !projectTradeId ? 'not-allowed' : 'pointer',
            }}
            disabled={!projectTradeId}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ──────────────────────────────────────

const sectionHeadStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
}

const timingLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.05em',
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
  marginBottom: 5,
}

const timingInputStyle: React.CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 5,
  padding: '7px 10px',
  fontSize: 13,
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  outline: 'none',
  display: 'block',
}

const emptyTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-tertiary)',
  lineHeight: 1.5,
}

const itemCardStyle: React.CSSProperties = {
  background: 'var(--surface-muted)',
  border: '1px solid var(--border-light)',
  borderRadius: 5,
  padding: '8px 10px',
}

const itemInputStyle: React.CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border-light)',
  borderRadius: 4,
  padding: '5px 8px',
  fontSize: 12,
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  outline: 'none',
  display: 'block',
}

const addBtnStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 500,
  padding: '5px 14px',
  borderRadius: 5,
  border: '1px solid var(--border)',
  background: 'var(--topnav-bg)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const removeBtn: React.CSSProperties = {
  background: 'none', border: 'none',
  color: 'var(--text-tertiary)', cursor: 'pointer',
  fontSize: 18, lineHeight: 1, padding: '2px 4px',
  flexShrink: 0,
}

const footerPrimaryBtn: React.CSSProperties = {
  fontSize: 13, fontWeight: 500,
  padding: '7px 20px',
  borderRadius: 5,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const footerSecondaryBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 14px',
  borderRadius: 5,
  border: '1px solid var(--border)',
  background: 'var(--surface-muted)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const footerDangerBtn: React.CSSProperties = {
  fontSize: 12,
  padding: '6px 14px',
  borderRadius: 5,
  border: '1px solid var(--danger-light)',
  background: 'var(--danger-light)',
  color: 'var(--danger)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
