/// <reference lib="webworker" />
import {
	ASSET_CACHE,
	CACHE_LIMITS,
	CACHE_NAMES,
	DATA_CACHE,
	DOCUMENT_CACHE,
	IMAGE_CACHE,
	OFFLINE_PATH,
	shellAssetsFrom,
	strategyFor,
} from './cache-policy'

const worker = self as unknown as ServiceWorkerGlobalScope

worker.addEventListener('install', event => {
	// A rejected install leaves the app with no worker at all, so each step
	// below swallows its own failure.
	event.waitUntil(primeShell().then(() => worker.skipWaiting()))
})

worker.addEventListener('activate', event => {
	event.waitUntil(dropRetiredCaches().then(() => worker.clients.claim()))
})

worker.addEventListener('fetch', event => {
	const strategy = strategyFor(event.request, worker.location.origin)

	switch (strategy) {
		case 'passthrough':
			return
		case 'document':
			return event.respondWith(serveDocument(event.request))
		case 'navigation':
			return event.respondWith(serveWithoutStoring(event.request))
		case 'data':
			return event.respondWith(reviseAfterServing(DATA_CACHE, event.request))
		case 'static':
			return event.respondWith(reviseAfterServing(ASSET_CACHE, event.request))
		case 'asset':
			return event.respondWith(serveFromCacheFirst(ASSET_CACHE, event.request))
		case 'image':
			return event.respondWith(serveFromCacheFirst(IMAGE_CACHE, event.request))
	}
})

/**
 * Two documents and the asset URLs read out of **both**, so one controlled page
 * load is enough for a cold start with no network. `/offline` is primed for its
 * own chunk as much as for its markup: without it the page cannot hydrate, and
 * the list only an effect can fill stays blank (§ R24).
 */
async function primeShell(): Promise<void> {
	const documents = await caches.open(DOCUMENT_CACHE)

	const pages = await Promise.all(
		[OFFLINE_PATH, '/'].map(path => store(documents, path)),
	)

	const urls = new Set(
		pages.flatMap(html => (html === null ? [] : shellAssetsFrom(html))),
	)

	if (urls.size === 0) return

	const assets = await caches.open(ASSET_CACHE)

	await Promise.all(
		[...urls].map(url => assets.add(url).catch(() => undefined)),
	)
}

async function store(cache: Cache, path: string): Promise<string | null> {
	try {
		const response = await fetch(path, { cache: 'reload' })
		if (!response.ok) return null

		const html = await response.clone().text()
		await cache.put(path, response)

		return html
	} catch {
		return null
	}
}

/**
 * A schema version retires a cache wholesale; a **deploy** does not bump it, so
 * a page already open goes on finding the chunks it asks for (§ R24).
 */
async function dropRetiredCaches(): Promise<void> {
	const known = new Set<string>(CACHE_NAMES)
	const names = await caches.keys()

	await Promise.all(
		names
			.filter(name => name.startsWith('rci-') && !known.has(name))
			.map(name => caches.delete(name)),
	)
}

/** Network first, so a reachable server never serves a stale page. */
async function serveDocument(request: Request): Promise<Response> {
	const cache = await caches.open(DOCUMENT_CACHE)

	try {
		const response = await fetch(request)

		if (response.ok) {
			await cache.put(request, response.clone())
			void trim(DOCUMENT_CACHE)
		}

		return response
	} catch {
		const cached = await cache.match(request)

		return cached ?? offlineFallback(request)
	}
}

/** Reached by the pages whose render carries a session, so nothing is stored. */
async function serveWithoutStoring(request: Request): Promise<Response> {
	try {
		return await fetch(request)
	} catch {
		return offlineFallback(request)
	}
}

/**
 * A redirect, not the offline document under the requested URL: as a body it
 * would leave the router hydrating one route beneath another route's path.
 * Measured in a browser — a navigation does follow a worker's redirect.
 */
async function offlineFallback(request: Request): Promise<Response> {
	const url = new URL(request.url)

	if (url.pathname === OFFLINE_PATH) {
		// On the path alone: the redirect below adds a `?from=` the primed copy
		// has not got, and a cache read honours the query.
		const cache = await caches.open(DOCUMENT_CACHE)

		return (await cache.match(OFFLINE_PATH)) ?? Response.error()
	}

	const from = encodeURIComponent(`${url.pathname}${url.search}`)

	return Response.redirect(`${OFFLINE_PATH}?from=${from}`, 302)
}

async function reviseAfterServing(
	name: string,
	request: Request,
): Promise<Response> {
	const cache = await caches.open(name)
	const cached = await cache.match(request)

	const network = fetch(request).then(async response => {
		if (response.ok) {
			await cache.put(request, response.clone())
			void trim(name)
		}

		return response
	})

	if (!cached) return network

	void network.catch(() => undefined)

	return cached
}

async function serveFromCacheFirst(
	name: string,
	request: Request,
): Promise<Response> {
	const cache = await caches.open(name)
	const cached = await cache.match(request)
	if (cached) return cached

	const response = await fetch(request)

	// A cross-origin photo comes back opaque: no status to read, kept anyway.
	if (response.ok || response.type === 'opaque') {
		await cache.put(request, response.clone())
		void trim(name)
	}

	return response
}

async function trim(name: string): Promise<void> {
	const limit = CACHE_LIMITS[name]
	if (limit === undefined) return

	const cache = await caches.open(name)
	const keys = await cache.keys()
	if (keys.length <= limit) return

	await Promise.all(
		keys.slice(0, keys.length - limit).map(key => cache.delete(key)),
	)
}
