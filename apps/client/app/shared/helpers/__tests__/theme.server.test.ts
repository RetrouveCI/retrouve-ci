import { getThemePreferenceFromRequest } from '../theme.server'

const withCookie = (cookie?: string) =>
	new Request('https://retrouve.ci/', {
		headers: cookie === undefined ? {} : { Cookie: cookie },
	})

describe('getThemePreferenceFromRequest', () => {
	it.each(['light', 'dark', 'system'] as const)('reads %s back', preference => {
		expect(
			getThemePreferenceFromRequest(withCookie(`theme=${preference}`)),
		).toBe(preference)
	})

	/**
	 * The default is what made this step necessary: falling back to `light` opened
	 * a phone set to dark in white, which is the one answer the device had already
	 * given.
	 */
	it('defaults to system when no cookie was ever set', () => {
		expect(getThemePreferenceFromRequest(withCookie())).toBe('system')
	})

	it('defaults to system when other cookies are present but not this one', () => {
		expect(
			getThemePreferenceFromRequest(
				withCookie('better-auth.session_token=abc'),
			),
		).toBe('system')
	})

	// A value from an older build, or a hand-edited cookie, must not reach the DOM
	// — it is interpolated straight into a class name on `<html>`.
	it.each(['auto', 'DARK', '', 'light dark', '<script>'])(
		'refuses %s and falls back to system',
		value => {
			expect(getThemePreferenceFromRequest(withCookie(`theme=${value}`))).toBe(
				'system',
			)
		},
	)

	// `;` separates cookies, so a trailing one is a neighbour, not a payload.
	it('reads only up to the cookie separator', () => {
		expect(
			getThemePreferenceFromRequest(withCookie('theme=dark; other=x')),
		).toBe('dark')
	})

	it('finds the cookie when it is not the first one', () => {
		expect(
			getThemePreferenceFromRequest(
				withCookie('session=x; theme=dark; other=y'),
			),
		).toBe('dark')
	})

	// `themes=dark` is a different cookie and must not be mistaken for this one.
	it('does not match a cookie whose name merely ends with it', () => {
		expect(getThemePreferenceFromRequest(withCookie('mytheme=dark'))).toBe(
			'system',
		)
	})
})
