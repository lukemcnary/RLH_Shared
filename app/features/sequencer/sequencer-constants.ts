// -------------------------------------------------------
// Sequencer Constants
//
// All visual geometry, zoom bounds, and timing constants
// used across the sequencer board and its view components.
// -------------------------------------------------------

/** Default pixels-per-day scale for the sequencing timeline. */
export const PX_PER_DAY_DEFAULT = 18

/** Default horizon in days when project dates are not set. */
export const DEFAULT_HORIZON_DAYS = 365 * 3

/** Project overview scale as a ratio of the sequencing scale. */
export const PROJECT_SCALE_RATIO = 7 / 30

/** Months of lead time shown before project start in the overview. */
export const OVERVIEW_LEAD_MONTHS = 3

/** Days of lead time shown before project start in the sequencing view. */
export const SEQUENCING_LEAD_DAYS = 30

/** Width of the gate label column (px) in the sequencing view. */
export const LANE_LABEL_W = 196

/** Top padding above the first mobilization row (px). */
export const LABEL_TOP_PAD = 76

/** Height of a single mobilization row in the sequencing timeline (px). */
export const TIMELINE_ROW_H = 92

/** Minimum height for a gate with no mobilizations (px). */
export const EMPTY_GATE_ROW_H = LABEL_TOP_PAD + TIMELINE_ROW_H + 24

/** Width of a storyline card (px). */
export const STORYLINE_CARD_W = 220

/** Height of a collapsed storyline card (px). */
export const STORYLINE_COLLAPSED_H = 54

/** Height of an expanded storyline card (px). */
export const STORYLINE_EXPANDED_H = 136

/** Height of a storyline row slot (px). */
export const STORYLINE_ROW_H = 118

/** Height of the vertical stem connecting a storyline card to the axis (px). */
export const STORYLINE_STEM_H = 28

/** Height of the sticky timeline header bar (px). */
export const HEADER_H = 40

/** Minimum zoom level (px per day). */
export const ZOOM_MIN = 8

/** Maximum zoom level (px per day). */
export const ZOOM_MAX = 56

/** Zoom step size (px per day per click). */
export const ZOOM_STEP = 4
