import { DOCUMENT_CACHE } from '@/sw/cache-policy'
import { readViewedListings, type ViewedListing } from './viewed-listings'

/**
 * The viewed index intersected with what the worker actually holds. The badge
 * on this list reads « EN CACHE », so it has to be true: a document the trim
 * has since dropped would otherwise offer a link that lands straight back on
 * the offline page.
 */
export async function listingsAvailableOffline(): Promise<ViewedListing[]> {
	const entries = readViewedListings()
	if (entries.length === 0) return []
	if (typeof caches === 'undefined') return []

	let cache: Cache

	try {
		cache = await caches.open(DOCUMENT_CACHE)
	} catch {
		return []
	}

	const checked = await Promise.all(
		entries.map(async entry => {
			// `?published=1` survives a redirect on the way in, so the search is
			// ignored rather than made part of the key.
			const hit = await cache
				.match(`/posts/${entry.id}`, { ignoreSearch: true })
				.catch(() => undefined)

			return hit ? entry : null
		}),
	)

	return checked.filter((entry): entry is ViewedListing => entry !== null)
}
