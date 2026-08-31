import {
	DEFAULT_THEME_PREFERENCE,
	THEME_COOKIE,
	isThemePreference,
	type ThemePreference,
} from './theme'

/**
 * Only the **preference** can be read server-side. `system` cannot be resolved
 * here — `prefers-color-scheme` is a media query, and the client hint that
 * mirrors it is not sent on a first request, which is precisely the visit that
 * has to be right. The document's inline script resolves it before first paint;
 * see `root.tsx`.
 */
export function getThemePreferenceFromRequest(
	request: Request,
): ThemePreference {
	const cookie = request.headers.get('Cookie') ?? ''
	const match = cookie.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]*)`))
	const value = match?.[1]

	return isThemePreference(value) ? value : DEFAULT_THEME_PREFERENCE
}
