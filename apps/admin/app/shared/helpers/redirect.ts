/**
 * Default landing page once an admin is authenticated and no specific
 * destination was requested.
 */
export const DEFAULT_REDIRECT = '/'

/**
 * Keep only internal, non-auth paths. This avoids open redirects (external
 * URLs, protocol-relative `//host`) and login loops (`/auth/*` destinations).
 */
export function sanitizeRedirect(value: string | null | undefined): string {
	if (!value) return DEFAULT_REDIRECT
	if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_REDIRECT
	if (value === '/auth' || value.startsWith('/auth/')) return DEFAULT_REDIRECT
	return value
}

/**
 * Append a `redirectTo` query param to `path`, preserving where the admin was
 * headed. Returns `path` untouched when the destination is the default.
 */
export function withRedirect(path: string, redirectTo: string | null): string {
	const safe = sanitizeRedirect(redirectTo)
	if (safe === DEFAULT_REDIRECT) return path
	return `${path}?redirectTo=${encodeURIComponent(safe)}`
}

/** Build the login URL that remembers the page the admin came from. */
export function loginUrlWithRedirect(redirectTo: string | null): string {
	return withRedirect('/auth/login', redirectTo)
}

/**
 * Absolute URL of a page in this app, for a link that leaves it — the emailed
 * password-reset link, whose relative path better-auth resolves against the
 * API's own origin, where nothing serves it. `ADMIN_APP_URL` is what a
 * deployment behind a reverse proxy needs, since the request the server sees
 * then carries the internal origin; the request's own origin is right in
 * development and behind no proxy.
 */
export function appUrl(path: string, request: Request): string {
	const configured = process.env['ADMIN_APP_URL']?.trim()
	return new URL(path, configured || new URL(request.url).origin).toString()
}
