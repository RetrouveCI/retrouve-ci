import {
	appUrl,
	DEFAULT_REDIRECT,
	loginUrlWithRedirect,
	sanitizeRedirect,
	toRoutePath,
	withRedirect,
} from '../redirect'

describe('sanitizeRedirect', () => {
	it('keeps an internal path', () => {
		expect(sanitizeRedirect('/qr/generate?count=5')).toBe(
			'/qr/generate?count=5',
		)
	})

	it('falls back to the default when nothing is given', () => {
		expect(sanitizeRedirect(null)).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect(undefined)).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect('')).toBe(DEFAULT_REDIRECT)
	})

	it('refuses an absolute URL, so the param cannot become an open redirect', () => {
		expect(sanitizeRedirect('https://evil.example/steal')).toBe(
			DEFAULT_REDIRECT,
		)
		expect(sanitizeRedirect('javascript:alert(1)')).toBe(DEFAULT_REDIRECT)
	})

	// A `.data` destination serves the raw turbo-stream payload instead of a page,
	// so a stale or crafted one must not be honoured either.
	it('refuses a single-fetch data path', () => {
		expect(sanitizeRedirect('/notifications.data')).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect('/notifications.data?_routes=x')).toBe(
			DEFAULT_REDIRECT,
		)
		expect(sanitizeRedirect('/_root.data')).toBe(DEFAULT_REDIRECT)
	})

	it('refuses a protocol-relative path', () => {
		expect(sanitizeRedirect('//evil.example')).toBe(DEFAULT_REDIRECT)
	})

	it('refuses an auth destination, so signing in cannot loop', () => {
		expect(sanitizeRedirect('/auth')).toBe(DEFAULT_REDIRECT)
		expect(sanitizeRedirect('/auth/login')).toBe(DEFAULT_REDIRECT)
	})
})

describe('withRedirect', () => {
	it('appends the destination, encoded', () => {
		expect(withRedirect('/auth/login', '/qr/generate?count=5')).toBe(
			'/auth/login?redirectTo=%2Fqr%2Fgenerate%3Fcount%3D5',
		)
	})

	it('leaves the path untouched when the destination is the default', () => {
		expect(withRedirect('/auth/login', DEFAULT_REDIRECT)).toBe('/auth/login')
		expect(withRedirect('/auth/login', null)).toBe('/auth/login')
	})

	it('drops a destination that did not survive sanitizing', () => {
		expect(withRedirect('/auth/login', 'https://evil.example')).toBe(
			'/auth/login',
		)
	})
})

describe('loginUrlWithRedirect', () => {
	it('builds the login URL that remembers where the admin was headed', () => {
		expect(loginUrlWithRedirect('/orders')).toBe(
			'/auth/login?redirectTo=%2Forders',
		)
	})
})

describe('appUrl', () => {
	const request = new Request('http://localhost:3001/administrators')

	afterEach(() => {
		delete process.env['ADMIN_APP_URL']
	})

	it("falls back to the request's own origin when nothing is configured", () => {
		expect(appUrl('/auth/reset-password', request)).toBe(
			'http://localhost:3001/auth/reset-password',
		)
	})

	it('prefers the configured public URL, which is what a proxy needs', () => {
		process.env['ADMIN_APP_URL'] = 'https://admin.retrouveci.com'

		expect(appUrl('/auth/reset-password', request)).toBe(
			'https://admin.retrouveci.com/auth/reset-password',
		)
	})

	it('tolerates a trailing slash and surrounding whitespace', () => {
		process.env['ADMIN_APP_URL'] = '  https://admin.retrouveci.com/  '

		expect(appUrl('/auth/reset-password', request)).toBe(
			'https://admin.retrouveci.com/auth/reset-password',
		)
	})

	it('ignores a blank value rather than building an unusable URL', () => {
		process.env['ADMIN_APP_URL'] = '   '

		expect(appUrl('/auth/reset-password', request)).toBe(
			'http://localhost:3001/auth/reset-password',
		)
	})
})

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
