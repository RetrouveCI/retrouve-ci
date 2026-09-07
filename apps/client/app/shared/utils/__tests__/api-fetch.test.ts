import { ApiError, apiFetch } from '../api-fetch'

function mockFetch(response: Response) {
	const spy = vi.fn().mockResolvedValue(response)
	vi.stubGlobal('fetch', spy)
	return spy
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('the public apiFetch', () => {
	/**
	 * The other half of the guarantee the backoffice's own spec makes: the public
	 * app must never claim the admin audience, or an injected script could read
	 * the backoffice session.
	 */
	it('sends no X-Auth-Audience header', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items')

		const headers = spy.mock.calls[0]?.[1]?.headers as Record<string, string>
		expect(headers['X-Auth-Audience']).toBeUndefined()
		expect(headers['Content-Type']).toBe('application/json')
	})

	it('forwards credentials, so the session cookie travels', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items')

		expect(spy.mock.calls[0]?.[1]?.credentials).toBe('include')
	})

	it('raises an ApiError carrying the status and the API message', async () => {
		mockFetch(
			new Response(
				JSON.stringify({ statusCode: 400, message: 'Validation failed' }),
				{ status: 400 },
			),
		)

		await expect(apiFetch('/lost-items')).rejects.toThrowError(
			new ApiError(400, 'Validation failed'),
		)
	})

	it('falls back to the status text when the body is not JSON', async () => {
		mockFetch(new Response('<html>502</html>', { status: 502 }))

		await expect(apiFetch('/lost-items')).rejects.toThrowError(ApiError)
	})

	it('answers undefined on 204 rather than trying to parse a body', async () => {
		mockFetch(new Response(null, { status: 204 }))

		await expect(apiFetch('/lost-items')).resolves.toBeUndefined()
	})

	it('prefixes the path with API_URL, read at call time', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items')

		expect(spy.mock.calls[0]?.[0]).toBe('http://api.test/lost-items')
	})
})

/** R44, and the reason it is one place rather than forty-five. */
describe('apiFetch speaking for the visitor', () => {
	const incoming = (headers: Record<string, string>) =>
		new Request('http://localhost:3000/q/RCI-1', { headers })

	const headersOf = (spy: ReturnType<typeof mockFetch>) =>
		spy.mock.calls[0]?.[1]?.headers as Record<string, string>

	it('derives the cookie and the caller address from the request', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items', {
			request: incoming({
				cookie: 'a=b',
				'x-forwarded-for': '41.66.1.1, 10.0.0.5',
			}),
		})

		expect(headersOf(spy).Cookie).toBe('a=b')
		expect(headersOf(spy)['X-Client-Ip']).toBe('41.66.1.1')
	})

	// The API trusts the value as given, so the whole chain would name a proxy.
	it('sends the first hop only', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/x', {
			request: incoming({ 'x-forwarded-for': '  41.66.1.1 , 10.0.0.5 ' }),
		})

		expect(headersOf(spy)['X-Client-Ip']).toBe('41.66.1.1')
	})

	it('falls back to x-real-ip', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/x', { request: incoming({ 'x-real-ip': '41.66.1.2' }) })

		expect(headersOf(spy)['X-Client-Ip']).toBe('41.66.1.2')
	})

	// In development there is no proxy in front, and `request.ip` is then right.
	it('sends no address at all when the request carries none', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/x', { request: incoming({ cookie: 'a=b' }) })

		expect(headersOf(spy)['X-Client-Ip']).toBeUndefined()
		expect(headersOf(spy).Cookie).toBe('a=b')
	})

	// `Origin` is passed beside `request` by the four better-auth writes.
	it('lets an explicit header win over a derived one', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/x', {
			request: incoming({ cookie: 'a=b' }),
			headers: { Origin: 'https://retrouve.ci', Cookie: 'c=d' },
		})

		expect(headersOf(spy).Origin).toBe('https://retrouve.ci')
		expect(headersOf(spy).Cookie).toBe('c=d')
	})

	// `request` is ours, not `fetch`'s: it must not reach the call itself.
	it('does not pass the request on to fetch', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/x', { request: incoming({}) })

		expect(spy.mock.calls[0]?.[1]).not.toHaveProperty('request')
	})
})
