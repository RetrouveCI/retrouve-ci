import { THEME_COOKIE, type Theme } from './theme'

export function getThemeFromRequest(request: Request): Theme {
	const cookie = request.headers.get('Cookie') ?? ''
	const match = cookie.match(
		new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=(light|dark)`),
	)
	return match?.[1] === 'dark' ? 'dark' : 'light'
}
