import {
	DEFAULT_REDIRECT,
	AUTH_PATHS,
	loginUrlWithRedirect,
	sanitizeRedirect,
	toRoutePath,
} from '../redirect'

describe('toRoutePath', () => {
	const at = (url: string) => toRoutePath(`https://retrouve.ci${url}`)

	it('strips the single-fetch suffix and its internal query param', () => {
		expect(
			at('/notifications.data?_routes=routes%2Fnotifications%2F_index'),
		).toBe('/notifications')
	})

	it('resolves the root data URL to the root path', () => {
		expect(at('/_root.data')).toBe('/')
	})

	it('keeps a real query string while dropping only `_routes`', () => {
		expect(at('/posts.data?_routes=routes%2Fposts&page=2&type=lost')).toBe(
			'/posts?page=2&type=lost',
		)
	})

	it('leaves an ordinary document request untouched', () => {
		expect(at('/notifications')).toBe('/notifications')
		expect(at('/posts?page=2')).toBe('/posts?page=2')
	})
})

describe('sanitizeRedirect', () => {
	it('keeps an internal path', () => {
		expect(sanitizeRedirect('/account/posts')).toBe('/account/posts')
	})

	it('falls back to the default when nothing is given', () => {
		expect(sanitizeRedirect(null)).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect('')).toBe(DEFAULT_REDIRECT)
	})

	it('refuses an absolute or protocol-relative URL', () => {
		expect(sanitizeRedirect('https://evil.example/steal')).toBe(
			DEFAULT_REDIRECT,
		)
		expect(sanitizeRedirect('//evil.example')).toBe(DEFAULT_REDIRECT)
	})

	// Walks AUTH_PATHS on purpose: the guard used to be a prefix test on `/auth`,
	// and a path added to the app without being added there would be a redirect
	// straight back into the login screen.
	it.each(AUTH_PATHS)('refuses %s, which would loop', path => {
		expect(sanitizeRedirect(path)).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect(`${path}?redirectTo=%2F`)).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect(`${path}/`)).toBe(DEFAULT_REDIRECT)
	})

	// A `.data` destination serves the raw turbo-stream payload instead of a page.
	it('refuses a single-fetch data path', () => {
		expect(sanitizeRedirect('/notifications.data')).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect('/notifications.data?_routes=x')).toBe(
			DEFAULT_REDIRECT,
		)
		expect(sanitizeRedirect('/_root.data')).toBe(DEFAULT_REDIRECT)
	})
})

describe('loginUrlWithRedirect', () => {
	it('remembers a real destination', () => {
		expect(loginUrlWithRedirect('/account/posts')).toBe(
			'/login?redirectTo=%2Faccount%2Fposts',
		)
	})

	it('omits the param when the destination is the default', () => {
		expect(loginUrlWithRedirect(DEFAULT_REDIRECT)).toBe('/login')
	})
})
