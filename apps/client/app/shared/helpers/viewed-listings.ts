const STORAGE_KEY = 'retrouveci.viewed-listings.v1'

/** Enough to fill the offline list twice over; the cache holds 40 documents. */
const MAX_ENTRIES = 12

export interface ViewedListing {
	id: string
	title: string
	location: string
}

/**
 * Read back from a store the visitor can edit, so each field is re-checked
 * rather than trusted — an index written by an older build must read as absent
 * instead of reaching the offline page as a wrong shape.
 */
function asViewedListing(value: unknown): ViewedListing | null {
	if (typeof value !== 'object' || value === null) return null

	const { id, title, location } = value as Record<string, unknown>

	if (typeof id !== 'string' || id === '') return null
	if (typeof title !== 'string' || title === '') return null

	return { id, title, location: typeof location === 'string' ? location : '' }
}

export function readViewedListings(): ViewedListing[] {
	let raw: string | null

	try {
		raw = localStorage.getItem(STORAGE_KEY)
	} catch {
		return []
	}

	if (raw === null) return []

	let parsed: unknown

	try {
		parsed = JSON.parse(raw)
	} catch {
		return []
	}

	if (!Array.isArray(parsed)) return []

	return parsed
		.map(asViewedListing)
		.filter((entry): entry is ViewedListing => entry !== null)
		.slice(0, MAX_ENTRIES)
}

/** Most recent first, one entry per listing. */
export function rememberViewedListing(entry: ViewedListing): void {
	const kept = readViewedListings().filter(seen => seen.id !== entry.id)

	try {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify([entry, ...kept].slice(0, MAX_ENTRIES)),
		)
	} catch {
		return
	}
}
