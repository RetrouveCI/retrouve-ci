import { ApiError, apiFetch } from '../api-fetch'

function mockFetch(response: Response) {
	const spy = vi.fn().mockResolvedValue(response)
	vi.stubGlobal('fetch', spy)
	return spy
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('the backoffice apiFetch', () => {
	/**
	 * The header is what tells the API which of the two sessions to read on a
	 * server-side call, which carries no `Origin`. Losing it would silently make
	 * every backoffice call authenticate against the public app and answer 401.
	 */
	it('sends X-Auth-Audience on every call', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/contact-messages')

		const headers = spy.mock.calls[0]?.[1]?.headers as Record<string, string>
		expect(headers['X-Auth-Audience']).toBe('admin')
		expect(headers['Content-Type']).toBe('application/json')
	})

	it('forwards credentials, so the session cookie travels', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/contact-messages')

		expect(spy.mock.calls[0]?.[1]?.credentials).toBe('include')
	})

	it('lets a caller add headers without dropping the audience', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/contact-messages', { headers: { Cookie: 'a=b' } })

		const headers = spy.mock.calls[0]?.[1]?.headers as Record<string, string>
		expect(headers['X-Auth-Audience']).toBe('admin')
		expect(headers['Cookie']).toBe('a=b')
	})

	it('raises an ApiError carrying the status and the API message', async () => {
		mockFetch(
			new Response(
				JSON.stringify({ statusCode: 404, message: 'Introuvable' }),
				{
					status: 404,
				},
			),
		)

		await expect(apiFetch('/contact-messages/x')).rejects.toThrowError(
			new ApiError(404, 'Introuvable'),
		)
	})

	it('joins a message the API sends as an array', async () => {
		mockFetch(
			new Response(JSON.stringify({ statusCode: 400, message: ['a', 'b'] }), {
				status: 400,
			}),
		)

		await expect(apiFetch('/contact-messages')).rejects.toThrowError(
			new ApiError(400, 'a, b'),
		)
	})

	it('answers undefined on 204 rather than trying to parse a body', async () => {
		mockFetch(new Response(null, { status: 204 }))

		await expect(apiFetch('/contact-messages/x')).resolves.toBeUndefined()
	})

	it('prefixes the path with API_URL, read at call time', async () => {
		const spy = mockFetch(new Response('{}', { status: 200 }))

		await apiFetch('/lost-items')

		expect(spy.mock.calls[0]?.[0]).toBe('http://api.test/lost-items')
	})
})
