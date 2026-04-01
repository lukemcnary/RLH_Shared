'use client'

// -------------------------------------------------------
// MobilizationCard — Trevor's card structure, RangelineOS skin
// -------------------------------------------------------

import { useRef, useState, useCallback } from 'react'
import type { SequenceMobilizationProjection } from '@/types/database'

interface MobilizationCardProps {
  mobilization: SequenceMobilizationProjection
  row: number
  rowHeight: number
  pxPerDay: number
  timelineLeadDays?: number
  projectStartDate: string
  mobNumber: string
  labelTopPad: number
  onClick: () => void
  onUpdateTimeline: (timeline: { startOffset: number; duration: number; displayOrder: number }) => void
}

const BAR_H       = 14
const MIN_DUR     = 1
const DRAG_THRESH = 4

type DragType = 'move' | 'resize-left' | 'resize-right' | null

export function MobilizationCard({
  mobilization: mob,
  row,
  rowHeight,
  pxPerDay,
  timelineLeadDays = 0,
  projectStartDate,
  mobNumber,
  labelTopPad,
  onClick,
  onUpdateTimeline,
}: MobilizationCardProps) {
  void projectStartDate
  const outerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{
    type: DragType
    startX: number
    startY: number
    startOffset: number
    startDuration: number
    startDisplayOrder: number
    startRenderedRow: number
    moved: boolean
  } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<{ startOffset: number; duration: number; displayOrder: number } | null>(null)

  const displayStart    = preview?.startOffset ?? mob.resolvedStartOffset
  const displayDuration = preview?.duration    ?? mob.projectedDuration
  const displayRow      = preview?.displayOrder ?? row

  const left     = (displayStart + timelineLeadDays) * pxPerDay
  const top      = labelTopPad + displayRow * rowHeight
  const barWidth = Math.max(MIN_DUR * pxPerDay, displayDuration * pxPerDay)

  const tradeColor = mob.tradeType.color ?? 'var(--accent)'
  const durationLabel = `${displayDuration}d`

  // ── Pointer handlers ──────────────────────────────────

  const startDrag = useCallback((e: React.PointerEvent, type: DragType) => {
    if (!type) return
    e.stopPropagation()
    dragState.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startOffset: mob.resolvedStartOffset,
      startDuration: mob.projectedDuration,
      startDisplayOrder: mob.displayOrder ?? row,
      startRenderedRow: row,
      moved: false,
    }
    outerRef.current?.setPointerCapture(e.pointerId)
    document.body.classList.add('sequencer-no-select')
  }, [mob.displayOrder, mob.projectedDuration, mob.resolvedStartOffset, row])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current
    if (!ds) return
    const dx = e.clientX - ds.startX
    const dy = e.clientY - ds.startY
    const delta = Math.round(dx / pxPerDay)
    const rowDelta = Math.round(dy / rowHeight)
    const nextDisplayOrder = rowDelta === 0
      ? ds.startDisplayOrder
      : Math.max(0, ds.startRenderedRow + rowDelta)
    if (!ds.moved && Math.max(Math.abs(dx), Math.abs(dy)) > DRAG_THRESH) { ds.moved = true; setIsDragging(true) }
    if (!ds.moved) return
    if (ds.type === 'move') {
      setPreview({
        startOffset: Math.max(0, ds.startOffset + delta),
        duration: ds.startDuration,
        displayOrder: nextDisplayOrder,
      })
    } else if (ds.type === 'resize-right') {
      setPreview({
        startOffset: ds.startOffset,
        duration: Math.max(MIN_DUR, ds.startDuration + delta),
        displayOrder: ds.startDisplayOrder,
      })
    } else if (ds.type === 'resize-left') {
      setPreview({
        startOffset: Math.max(0, ds.startOffset + delta),
        duration: Math.max(MIN_DUR, ds.startDuration - delta),
        displayOrder: ds.startDisplayOrder,
      })
    }
  }, [pxPerDay, rowHeight])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const ds = dragState.current
    if (!ds) return
    document.body.classList.remove('sequencer-no-select')
    outerRef.current?.releasePointerCapture(e.pointerId)
    if (ds.moved && preview) {
      onUpdateTimeline({
        startOffset: preview.startOffset,
        duration: preview.duration,
        displayOrder: preview.displayOrder,
      })
    } else if (!ds.moved) {
      onClick()
    }
    dragState.current = null
    setIsDragging(false)
    setPreview(null)
  }, [preview, onClick, onUpdateTimeline])

  const handleCancel = useCallback(() => {
    document.body.classList.remove('sequencer-no-select')
    dragState.current = null
    setIsDragging(false)
    setPreview(null)
  }, [])

  return (
    <div
      ref={outerRef}
      className="mob-card"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handleCancel}
      style={{
        position: 'absolute',
        left,
        top,
        width: barWidth,
        overflow: 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 20 : 2,
        userSelect: 'none',
      }}
    >
      {/* Label block — floats above the duration bar */}
      <div
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
        style={{
          position: 'absolute',
          left: 0,
          bottom: 'calc(100% + 6px)',
          minWidth: Math.max(barWidth, 120),
          maxWidth: Math.max(barWidth, 240),
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-float)',
          padding: '8px 10px',
          pointerEvents: 'auto',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Trade name + meta pills */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: mob.why ? 4 : 0 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {mob.tradeType.name || 'New Mobilization'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            {/* M-number chip */}
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.02em',
              background: 'var(--topnav-bg)',
              color: '#fff',
              borderRadius: 10,
              padding: '2px 6px',
              lineHeight: 1.4,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {mobNumber}
            </span>
            {/* Duration pill */}
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              background: 'var(--text-secondary)',
              color: '#fff',
              borderRadius: 10,
              padding: '2px 6px',
              lineHeight: 1.4,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {durationLabel}
            </span>
          </div>
        </div>

        {/* Builder intent (why) */}
        {mob.why && (
          <div style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {mob.why}
          </div>
        )}
      </div>

      {/* Duration bar */}
      <div
        onPointerDown={e => {
          if ((e.target as HTMLElement).dataset.handle) return
          startDrag(e, 'move')
        }}
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '100%',
          height: BAR_H,
          background: `${tradeColor}1A`,
          border: `1px solid ${tradeColor}44`,
          borderRadius: 5,
          overflow: 'visible',
        }}
      >
        {/* Marker lines */}
        {mob.markers.map(marker => (
          <div
            key={marker.id}
            title={marker.label}
            style={{
              position: 'absolute',
              left: `calc(${marker.position * 100}% - 1px)`,
              top: -4,
              width: 2,
              height: BAR_H + 8,
              borderRadius: 999,
              background: 'var(--yellow)',
              zIndex: 3,
            }}
          />
        ))}
      </div>

      {/* Resize handle LEFT */}
      <div
        data-handle="left"
        onPointerDown={e => { e.stopPropagation(); startDrag(e, 'resize-left') }}
        style={{
          position: 'absolute', left: 0, top: 0,
          width: 10, height: BAR_H,
          cursor: 'ew-resize', zIndex: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div className="resize-grip" style={{ width: 2, height: 10, borderRadius: 1, background: tradeColor, opacity: 0, transition: 'opacity 150ms' }} />
      </div>

      {/* Resize handle RIGHT */}
      <div
        data-handle="right"
        onPointerDown={e => { e.stopPropagation(); startDrag(e, 'resize-right') }}
        style={{
          position: 'absolute', right: 0, top: 0,
          width: 10, height: BAR_H,
          cursor: 'ew-resize', zIndex: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div className="resize-grip" style={{ width: 2, height: 10, borderRadius: 1, background: tradeColor, opacity: 0, transition: 'opacity 150ms' }} />
      </div>
    </div>
  )
}
