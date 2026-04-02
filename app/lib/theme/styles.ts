// -------------------------------------------------------
// Shared Style Constants
//
// Commonly repeated inline style objects used across the
// sequencer views and other feature components. Using shared
// objects reduces duplication and keeps the visual language
// consistent.
// -------------------------------------------------------

import type { CSSProperties } from 'react'

// ─── Timeline header ───────────────────────────────────

export const stickyTimelineHeader: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 20,
  background: 'var(--surface-primary)',
  borderBottom: '1px solid var(--border-light)',
  flexShrink: 0,
}

export const tickContainer: CSSProperties = {
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
}

// ─── Tick mark ─────────────────────────────────────────

export const tickMark: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  borderLeft: '1px solid var(--grid-line)',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 5,
}

export const tickLabel: CSSProperties = {
  fontSize: 10,
  color: 'var(--text-tertiary)',
  whiteSpace: 'nowrap',
}

export const monthTickLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  whiteSpace: 'nowrap',
}

// ─── Today marker ──────────────────────────────────────

export const todayLine: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: 1,
  background: 'var(--accent-light)',
  pointerEvents: 'none',
  zIndex: 1,
}

// ─── Week band (alternating shade) ─────────────────────

export const weekBand: CSSProperties = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  background: 'var(--grid-week)',
  pointerEvents: 'none',
}

// ─── Scrollable viewport ───────────────────────────────

export const scrollableViewport: CSSProperties = {
  flex: 1,
  overflow: 'auto',
  position: 'relative',
  minHeight: 0,
  background: 'var(--background)',
}

export const timelineCanvas: CSSProperties = {
  minHeight: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}

// ─── Card styles ───────────────────────────────────────

export const elevatedCard: CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border-light)',
  borderRadius: 8,
  boxShadow: 'var(--shadow-sm)',
}

export const surfaceCard: CSSProperties = {
  background: 'var(--surface-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: 8,
  overflow: 'hidden',
}

// ─── Button styles ─────────────────────────────────────

export const zoomBtnStyle: CSSProperties = {
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

export const smallSecondaryBtn: CSSProperties = {
  fontSize: 12,
  padding: '5px 12px',
  borderRadius: 5,
  border: '1px solid var(--border)',
  background: 'var(--surface-elevated)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const accentPillBtn: CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--accent)',
  background: 'var(--accent-light)',
  border: '1px solid var(--accent-medium)',
  borderRadius: 5,
  padding: '3px 9px',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const smallActionBtn: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  background: 'var(--surface-primary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const accentActionBtn: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid var(--accent-medium)',
  background: 'var(--accent-light)',
  color: 'var(--accent)',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

// ─── Text helpers ──────────────────────────────────────

export const sectionLabel: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

export const uppercaseLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase',
}

export const truncatedText: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

// ─── Duration pill ─────────────────────────────────────

export const durationPill: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  background: 'var(--surface-primary)',
  border: '1px solid var(--border-light)',
  borderRadius: 999,
  padding: '4px 8px',
  flexShrink: 0,
}

export const smallPill: CSSProperties = {
  fontSize: 10,
  color: 'var(--text-secondary)',
  flexShrink: 0,
  background: 'var(--surface-muted)',
  borderRadius: 999,
  padding: '3px 7px',
}
