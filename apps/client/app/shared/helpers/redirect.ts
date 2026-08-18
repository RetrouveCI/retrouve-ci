/**
 * Default landing page once a user is authenticated and no specific
 * destination was requested.
 */
export const DEFAULT_REDIRECT = '/account'

/**
 * Keep only internal, non-auth paths. This avoids open-redirects (external
 * URLs, protocol-relative `//host`) and login loops (`/auth/*` destinations).
 */
export function sanitizeRedirect(value: string | null | undefined): string {
	if (!value) return DEFAULT_REDIRECT
	if (!value.startsWith('/') || value.startsWith('//')) return DEFAULT_REDIRECT
	if (value === '/auth' || value.startsWith('/auth/')) return DEFAULT_REDIRECT
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
	return withRedirect('/auth/login', redirectTo)
}
