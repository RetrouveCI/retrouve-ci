/**
 * A phrase, not a corpus: one line typed into a search box. The ceiling is what
 * bounds the cost of an extraction — the invite is fixed, so the phrase is the
 * only part of the request a caller controls.
 */
export const PHRASE_MIN_LENGTH = 3
export const PHRASE_MAX_LENGTH = 200

/**
 * `unavailable` is a repli, never a panne: the gateway is unset, out of budget
 * or unreachable, and a search by filters is still open. The front reads the
 * status rather than an empty `filters`, which `interpreted` may also answer
 * when the sentence named nothing the app can filter on.
 */
export const SEARCH_INTERPRETATION_STATUSES = [
	'interpreted',
	'unavailable',
] as const

export type SearchInterpretationStatus =
	(typeof SEARCH_INTERPRETATION_STATUSES)[number]
