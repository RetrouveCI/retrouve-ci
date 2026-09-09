import { DEFAULT_REDIRECT, sanitizeRedirect } from '@/shared/helpers/redirect'

/**
 * Where « Réessayer » goes. The worker hands over the path it could serve from
 * neither the network nor the cache, and it arrives in the URL, so it is guarded
 * by `sanitizeRedirect` — the app's only open-redirect check. Its own fallback
 * is `/account`, which no offline visitor can read, and that one answer is
 * mapped onto the home page.
 */
export function retryTarget(from: string | null): string {
	const safe = sanitizeRedirect(from)

	return safe === DEFAULT_REDIRECT ? '/' : safe
}
