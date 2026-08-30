/**
 * Default landing page once a user is authenticated and no specific
 * destination was requested.
 */
export const DEFAULT_REDIRECT = '/account'

const DATA_SUFFIX = '.data'
const ROOT_DATA_PATH = '/_root'

function isDataPath(value: string): boolean {
	return (value.split('?')[0] ?? '').endsWith(DATA_SUFFIX)
}

/**
 * Single fetch asks a loader for `/notifications.data?_routes=…`, the root's for
 * `/_root.data`. That is the URL a `redirect()` thrown from a loader sees, and
 * sending someone back to one serves the raw payload instead of a page.
 */
export function toRoutePath(requestUrl: string): string {
	const url = new URL(requestUrl)
	url.searchParams.delete('_routes')

	const pathname = isDataPath(url.pathname)
		? url.pathname.slice(0, -DATA_SUFFIX.length)
		: url.pathname

	return `${pathname === ROOT_DATA_PATH || pathname === '' ? '/' : pathname}${url.search}`
}

/**
 * The auth pages, which a `redirectTo` may never point at: landing on one after
 * signing in is a loop. They used to share an `/auth` prefix and this was a
 * prefix test; without one, the set has to be named. A path added here must be
 * added to `routes.ts` too, and the reverse — `sanitizeRedirect`'s spec walks
 * this list.
 */
export const AUTH_PATHS = [
	'/login',
	'/register',
	'/password-forgotten',
	'/reset-password',
] as const

/** An auth page whatever query or trailing slash the value carries. */
function isAuthPath(value: string): boolean {
	const pathname = (value.split(/[?#]/)[0] ?? '').replace(/\/+$/, '')
	return AUTH_PATHS.some(path => pathname === path)
}

/**
 * Keep only internal, non-auth paths. This avoids open-redirects (external
 * URLs, protocol-relative `//host`) and login loops (an auth destination).
 */
export function sanitizeRedirect(value: string | null | undefined): string {
	if (!value) return DEFAULT_REDIRECT
	if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_REDIRECT
	if (isAuthPath(value)) return DEFAULT_REDIRECT
	if (isDataPath(value)) return DEFAULT_REDIRECT
	return value
}

/**
 * Append a `redirectTo` query param to `path`, preserving where the user was
 * headed. Returns `path` untouched when the destination is the default.
 */
export function withRedirect(path: string, redirectTo: string | null): string {
	const safe = sanitizeRedirect(redirectTo)
	if (safe === DEFAULT_REDIRECT) return path
	return `${path}?redirectTo=${encodeURIComponent(safe)}`
}

/** Build the login URL that remembers the page the user came from. */
export function loginUrlWithRedirect(redirectTo: string | null): string {
	return withRedirect('/login', redirectTo)
}
