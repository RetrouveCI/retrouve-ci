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
})
