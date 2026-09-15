import { interpretSearchPhraseSchema } from '@app/contracts/search-assistant'

/**
 * Below this, a filter or the plain text search already answers: « carte »,
 * « CNI Cocody ». A model earns its cost when the words carry a relation
 * between them — a place, a day, a possessive — and that starts at a sentence.
 */
const MIN_WORDS = 4

/**
 * The **one** judge of whether a search is a phrase, and it is read twice: the
 * action spends an extraction on it, and `/posts` suspends its live filtering
 * while one is being written. Two copies would let the list empty itself on a
 * sentence the action would then have interpreted anyway.
 *
 * The contract decides the bounds — a phrase the API would refuse with a `400`
 * is not one worth a round-trip.
 */
export function looksLikePhrase(value: string): boolean {
	const phrase = value.trim()

	if (!interpretSearchPhraseSchema.safeParse({ phrase }).success) return false

	return phrase.split(/\s+/).length >= MIN_WORDS
}
