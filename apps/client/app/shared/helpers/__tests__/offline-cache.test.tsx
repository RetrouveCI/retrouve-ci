import { DOCUMENT_CACHE } from '@/sw/cache-policy'
import { listingsAvailableOffline } from '../offline-cache'
import { rememberViewedListing } from '../viewed-listings'

/**
 * Runs against the real Cache API rather than a stub, which is the whole point:
 * what this reads is what the worker wrote, and a `match` that honours the query
 * or the method would pass a stub and fail a browser.
 */
beforeEach(async () => {
	localStorage.clear()
	await caches.delete(DOCUMENT_CACHE)
})

afterEach(async () => {
	localStorage.clear()
	await caches.delete(DOCUMENT_CACHE)
})

const listing = (id: string) => ({
	id,
	title: `Annonce ${id}`,
	location: 'Cocody, Abidjan',
})

async function storeDocument(path: string) {
	const cache = await caches.open(DOCUMENT_CACHE)
	await cache.put(path, new Response('<html></html>'))
}

describe('the listings really readable offline', () => {
	it('reads nothing when nothing has been read', async () => {
		await expect(listingsAvailableOffline()).resolves.toEqual([])
	})

	it('keeps a listing the worker holds', async () => {
		rememberViewedListing(listing('abc'))
		await storeDocument('/posts/abc')

		await expect(listingsAvailableOffline()).resolves.toEqual([listing('abc')])
	})

	it('drops one the trim has since dropped, badge and link being a promise', async () => {
		rememberViewedListing(listing('abc'))
		rememberViewedListing(listing('def'))
		await storeDocument('/posts/def')

		await expect(listingsAvailableOffline()).resolves.toEqual([listing('def')])
	})

	it('matches a document stored with the query a redirect added', async () => {
		rememberViewedListing(listing('abc'))
		await storeDocument('/posts/abc?published=1')

		await expect(listingsAvailableOffline()).resolves.toEqual([listing('abc')])
	})

	it('keeps the index order, most recent first', async () => {
		rememberViewedListing(listing('abc'))
		rememberViewedListing(listing('def'))
		await storeDocument('/posts/abc')
		await storeDocument('/posts/def')

		await expect(
			listingsAvailableOffline().then(list => list.map(entry => entry.id)),
		).resolves.toEqual(['def', 'abc'])
	})
})
