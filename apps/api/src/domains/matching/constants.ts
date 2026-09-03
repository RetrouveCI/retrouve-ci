export const MAX_CANDIDATES = 100
export const MATCH_SCORE_THRESHOLD = 50

export const SCORE_SAME_CATEGORY = 40
export const SCORE_SAME_VILLE = 25
export const SCORE_SAME_COMMUNE = 15
export const SCORE_EVENT_DATE_CLOSE = 20
export const SCORE_EVENT_DATE_NEAR = 10
export const SCORE_TEXT_OVERLAP = 10

/** A piece of ID is matched on its holder, not on its colour, and the number
 * alone clears `MATCH_SCORE_THRESHOLD`. */
export const SCORE_SAME_DOCUMENT_TYPE = 15
export const SCORE_SAME_HOLDER_NAME = 40
export const SCORE_SAME_DOCUMENT_NUMBER = 100

export const EVENT_DATE_CLOSE_DAYS = 7
export const EVENT_DATE_NEAR_DAYS = 30

export const MIN_OVERLAP_WORD_LENGTH = 5
