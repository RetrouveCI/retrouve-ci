import { requestOrigin } from '../origin'

function req(url: string, headers: Record<string, string> = {}): Request {
	return new Request(url, { headers })
}

describe('requestOrigin', () => {
	it('forwards the origin the browser actually sent', () => {
		const request = req('http://retrouveci.com/account/settings', {
			origin: 'https://retrouveci.com',
		})

		expect(requestOrigin(request)).toBe('https://retrouveci.com')
	})

	it('does not pass a null origin through', () => {
		const request = req('https://retrouveci.com/publish', { origin: 'null' })

		expect(requestOrigin(request)).toBe('https://retrouveci.com')
	})

	// The production bug: no `trust proxy`, so the server's own URL says `http`.
	it('takes the scheme from the proxy when the request carries no origin', () => {
		const request = req('http://retrouveci.com/account/settings', {
			'x-forwarded-proto': 'https',
		})

		expect(requestOrigin(request)).toBe('https://retrouveci.com')
	})

	it('prefers the forwarded host over the one the server was reached on', () => {
		const request = req('http://0.0.0.0:3000/account/settings', {
			'x-forwarded-proto': 'https',
			'x-forwarded-host': 'retrouveci.com',
		})

		expect(requestOrigin(request)).toBe('https://retrouveci.com')
	})

	it('reads only the first hop of a chained forwarded header', () => {
		const request = req('http://0.0.0.0:3000/', {
			'x-forwarded-proto': 'https, http',
			'x-forwarded-host': 'retrouveci.com, internal.lan',
		})

		expect(requestOrigin(request)).toBe('https://retrouveci.com')
	})

	it('falls back to the request url with neither header', () => {
		const request = req('http://localhost:3000/account/settings')

		expect(requestOrigin(request)).toBe('http://localhost:3000')
	})
})
