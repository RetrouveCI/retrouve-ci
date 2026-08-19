import {
	DEFAULT_REDIRECT,
	loginUrlWithRedirect,
	sanitizeRedirect,
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
