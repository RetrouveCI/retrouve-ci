/**
 * The two sides of a pair never write the same thing: a card prints in capitals
 * without accents, an Ivorian name is spelled several ways, and the surname and
 * the given names swap places from one form to the next.
 */

/** `5811403-13-0015703713RC` and `581140313 0015703713 RC` are one licence. */
export function normalizeDocumentNumber(value: string | null): string {
	return value ? value.toUpperCase().replace(/[^A-Z0-9]/g, '') : ''
}

/**
 * A sorted set of words, so the order of surname and given names means nothing.
 * An apostrophe closes up (`N'GUESSAN` is one word) where a hyphen opens out,
 * and a lone initial is dropped rather than compared.
 */
export function normalizeHolderName(value: string | null): string[] {
	if (!value) return []

	const words = value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toUpperCase()
		.replace(/['’`]/g, '')
		.split(/[^A-Z0-9]+/)
		.filter(word => word.length > 1)

	return [...new Set(words)].sort()
}

export type NameVerdict = 'match' | 'mismatch' | 'unknown'

/**
 * Three answers, not two. A card prints three given names where the person who
 * lost it writes one, so a subset is the same holder; a shared surname and
 * nothing else settles nothing, being far too common here.
 */
export function compareHolderNames(
	left: string | null,
	right: string | null,
): NameVerdict {
	const a = normalizeHolderName(left)
	const b = normalizeHolderName(right)

	if (a.length === 0 || b.length === 0) return 'unknown'

	const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a]

	if (shorter.every(word => longer.includes(word))) return 'match'

	return shorter.some(word => longer.includes(word)) ? 'unknown' : 'mismatch'
}

/** The same number is not a probable pair: it is the same document. */
export function sameDocumentNumber(
	left: string | null,
	right: string | null,
): boolean {
	const a = normalizeDocumentNumber(left)
	const b = normalizeDocumentNumber(right)

	return a.length > 0 && a === b
}
