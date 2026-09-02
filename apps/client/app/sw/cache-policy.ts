/**
 * What the worker does with a request, decided outside the worker so it can be
 * unit-tested: `service-worker.ts` only wires these verdicts to the Cache API.
 */

const CACHE_VERSION = 'v1'

export const DOCUMENT_CACHE = `rci-${CACHE_VERSION}-documents`
export const DATA_CACHE = `rci-${CACHE_VERSION}-data`
export const ASSET_CACHE = `rci-${CACHE_VERSION}-assets`
export const IMAGE_CACHE = `rci-${CACHE_VERSION}-images`

export const CACHE_NAMES = [
	DOCUMENT_CACHE,
	DATA_CACHE,
	ASSET_CACHE,
	IMAGE_CACHE,
] as const

/**
 * Entry ceilings, trimmed oldest-first: `cache.keys()` answers in insertion
 * order, so this is FIFO — the Cache API records no access time.
 */
export const CACHE_LIMITS: Record<string, number> = {
	[DOCUMENT_CACHE]: 40,
	[DATA_CACHE]: 60,
	[ASSET_CACHE]: 160,
	[IMAGE_CACHE]: 80,
}

export const OFFLINE_PATH = '/offline'

/**
 * The paths whose server render carries **no session**, measured. Everything
 * else is out on purpose: a stored `/account/*` or `/q/:code` document stays
 * readable on the device after the visitor signs out.
 */
const PUBLIC_PATHS = new Set([
	'/',
	'/about',
	'/contact',
	'/terms',
	'/privacy',
	'/stickers',
	'/posts',
	'/scan',
	OFFLINE_PATH,
])

const PUBLIC_PREFIXES = ['/posts/']

export function isPublicPath(pathname: string): boolean {
	if (PUBLIC_PATHS.has(pathname)) return true

	return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

const DATA_SUFFIX = '.data'

/** `/posts/abc.data` → `/posts/abc`, and the index's `/.data` → `/`. */
export function pathnameBehindData(pathname: string): string {
	return pathname.slice(0, -DATA_SUFFIX.length)
}

export type CacheStrategy =
	| 'passthrough'
	| 'document'
	| 'navigation'
	| 'data'
	| 'asset'
	| 'static'
	| 'image'

/** The shape the worker hands over; a `Request` satisfies it as it stands. */
export interface RequestFacts {
	url: string
	method: string
	mode: string
	destination: string
}

/**
 * Measured: `/assets/` is served `max-age=31536000, immutable` behind hashed
 * names, the one place a cache-first read can never be stale. A file from
 * `public/` shares the bare root and is served `max-age=0`.
 */
const HASHED_PREFIX = '/assets/'

export function strategyFor(
	request: RequestFacts,
	origin: string,
): CacheStrategy {
	if (request.method !== 'GET') return 'passthrough'

	const url = new URL(request.url)
	const sameOrigin = url.origin === origin

	if (!sameOrigin) {
		// The API and better-auth answer here, per session. A photo is the one
		// cross-origin GET worth keeping.
		return request.destination === 'image' ? 'image' : 'passthrough'
	}

	if (url.pathname.startsWith(HASHED_PREFIX)) {
		// 1.1 MB of decoder, useless without the network behind `/scan/status`.
		return url.pathname.endsWith('.wasm') ? 'passthrough' : 'asset'
	}

	// Never stored, but still owed the offline page over a browser error screen.
	if (request.mode === 'navigate') {
		return isPublicPath(url.pathname) ? 'document' : 'navigation'
	}

	if (url.pathname.endsWith(DATA_SUFFIX)) {
		return isPublicPath(pathnameBehindData(url.pathname))
			? 'data'
			: 'passthrough'
	}

	if (request.destination === 'image') return 'image'

	return 'static'
}

/**
 * Read out of a rendered document, not a build-time manifest: `react-router
 * build` emits none, and a run-time list cannot fall behind its build.
 */
export function shellAssetsFrom(html: string): string[] {
	const found = new Set<string>()

	for (const match of html.matchAll(
		/(?:src|href)="(\/assets\/[^"?#]+)(?:[?#][^"]*)?"/g,
	)) {
		const url = match[1]
		if (url && !url.endsWith('.wasm')) found.add(url)
	}

	return [...found]
}
