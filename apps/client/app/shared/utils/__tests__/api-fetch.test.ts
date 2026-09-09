import { ApiError, apiFetch } from '../api-fetch'

/** Required, so every call in the app carries one: see the R50 note below. */
const incoming = (headers: Record<string, string> = {}) =>
	new Request('http://localhost:3000/posts', { headers })

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

		await apiFetch('/lost-items', { request: incoming() })

		const headers = spy.mock.calls[0]?.[1]?.headers as Record<string, string>
		expect(headers['X-Auth-Audience']).toBeUndefined()
		expect(headers['Content-Type']).toBe('application/json')
	})

	it('forwards credentials, so the session cookie travels', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items', { request: incoming() })

		expect(spy.mock.calls[0]?.[1]?.credentials).toBe('include')
	})

	it('raises an ApiError carrying the status and the API message', async () => {
		mockFetch(
			new Response(
				JSON.stringify({ statusCode: 400, message: 'Validation failed' }),
				{ status: 400 },
			),
		)

		await expect(
			apiFetch('/lost-items', { request: incoming() }),
		).rejects.toThrowError(new ApiError(400, 'Validation failed'))
	})

	// The map both the pipe and the domain filter answer with, which
	// `ApiErrorBody` did not declare and nobody could read.
	it('carries the field errors the API names', async () => {
		mockFetch(
			new Response(
				JSON.stringify({
					statusCode: 400,
					message: 'Ce sticker est déjà activé',
					errors: { code: ['Ce sticker est déjà activé'] },
				}),
				{ status: 400 },
			),
		)

		await expect(
			apiFetch('/qr-codes/RCI-A/activate', { request: incoming() }),
		).rejects.toMatchObject({
			fieldErrors: { code: ['Ce sticker est déjà activé'] },
		})
	})

	it('carries an empty map when the API names no field', async () => {
		mockFetch(
			new Response(JSON.stringify({ statusCode: 500, message: 'boom' }), {
				status: 500,
			}),
		)

		await expect(
			apiFetch('/lost-items', { request: incoming() }),
		).rejects.toMatchObject({ fieldErrors: {} })
	})

	it('falls back to the status text when the body is not JSON', async () => {
		mockFetch(new Response('<html>502</html>', { status: 502 }))

		await expect(
			apiFetch('/lost-items', { request: incoming() }),
		).rejects.toThrowError(ApiError)
	})

	it('answers undefined on 204 rather than trying to parse a body', async () => {
		mockFetch(new Response(null, { status: 204 }))

		await expect(
			apiFetch('/lost-items', { request: incoming() }),
		).resolves.toBeUndefined()
	})

	it('prefixes the path with API_URL, read at call time', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items', { request: incoming() })

		expect(spy.mock.calls[0]?.[0]).toBe('http://api.test/lost-items')
	})
})

/** R44, and the reason it is one place rather than forty-five. */
describe('apiFetch speaking for the visitor', () => {
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

		await apiFetch('/x', { request: incoming() })

		expect(spy.mock.calls[0]?.[1]).not.toHaveProperty('request')
	})
})

// R50: optional forwarding left both `send-otp` callers, both
// `request-password-reset` callers and the contact form keyed on this container
// — 5 SMS per 15 minutes platform-wide. A required field makes that impossible.
describe('the rule itself', () => {
	it('refuses a call that speaks for no visitor', () => {
		// @ts-expect-error `request` is required: this is the guard.
		const call = () => apiFetch('/lost-items', { method: 'POST' })

		expect(call).toBeTypeOf('function')
	})
})
