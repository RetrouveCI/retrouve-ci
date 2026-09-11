// Accents and case aside: « evenements » finds « Événements », since nobody
// types the accents in a hurry.
export function normalizeForSearch(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim()
}

export function matchesQuery(text: string, query: string): boolean {
	const needle = normalizeForSearch(query)

	return !needle || normalizeForSearch(text).includes(needle)
}
