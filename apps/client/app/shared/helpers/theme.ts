/** What is actually painted. */
export type Theme = 'light' | 'dark'

/** What the visitor chose. `system` defers to the device. */
export type ThemePreference = Theme | 'system'

export const THEME_COOKIE = 'theme'

/**
 * Android's URL bar and the installed app's status bar. The header is
 * `bg-background`, so this is `--background` read as sRGB — the tag is served
 * before any stylesheet could resolve a token.
 */
export const THEME_COLOR: Record<Theme, string> = {
	light: '#ffffff',
	dark: '#080a0e',
}

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

/**
 * A device already carries an answer, so the app asks rather than assuming.
 * Falling back to `light` was the old behaviour and it made a phone set to dark
 * open white — the one thing the visitor had already said they did not want.
 */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system'

export function isThemePreference(value: unknown): value is ThemePreference {
	return THEME_PREFERENCES.includes(value as ThemePreference)
}

export const themeCookie = (preference: ThemePreference) =>
	`${THEME_COOKIE}=${preference};path=/;max-age=31536000;samesite=lax`
