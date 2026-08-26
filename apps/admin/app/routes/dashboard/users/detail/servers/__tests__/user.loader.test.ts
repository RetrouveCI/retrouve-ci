import type { User } from '../../../types/users.types'

const { requireAdminSession, getUserById } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getUserById: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../../servers/users.service', () => ({ getUserById }))

const { userLoader } = await import('../user.loader')

const COOKIE = 'retrouveci-admin.session_token=abc'

function requestFor() {
	return new Request('http://localhost:3001/users/user-1', {
		headers: { cookie: COOKIE },
	})
}

const USER = { id: 'user-1', name: 'Awa Traoré' } as User

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getUserById.mockReset().mockResolvedValue(USER)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('userLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await userLoader({ request, params: { id: 'user-1' } })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the user when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(
			userLoader({ request: requestFor(), params: { id: 'user-1' } }),
		).rejects.toBe(redirect)
		expect(getUserById).not.toHaveBeenCalled()
	})

	it('forwards the session cookie and the route id', async () => {
		await userLoader({ request: requestFor(), params: { id: 'user-1' } })

		expect(getUserById).toHaveBeenCalledWith(COOKIE, 'user-1')
	})

	it('hands the user back under the key the page reads', async () => {
		expect(
			await userLoader({ request: requestFor(), params: { id: 'user-1' } }),
		).toEqual({ user: USER })
	})

	/**
	 * `getUserById` filters on `role === 'user'`, so an administrator's id
	 * resolves to `null` here — this page is the public users' one. A redirect is
	 * the right answer: there is nothing to render, and a 404 boundary would look
	 * like a broken link.
	 */
	it('redirects to the list when no such user exists', async () => {
		getUserById.mockResolvedValue(null)

		const thrown = await userLoader({
			request: requestFor(),
			params: { id: 'ghost' },
		}).catch((error: unknown) => error as Response)

		expect(thrown).toBeInstanceOf(Response)
		expect((thrown as Response).status).toBe(302)
		expect((thrown as Response).headers.get('location')).toBe('/users')
	})

	// A route can be reached with no id at all; that must not be sent as the
	// literal `undefined` the filter would then match on.
	it('asks for the empty id rather than undefined when the param is missing', async () => {
		getUserById.mockResolvedValue(null)

		await expect(
			userLoader({ request: requestFor(), params: {} }),
		).rejects.toBeInstanceOf(Response)
		expect(getUserById).toHaveBeenCalledWith(COOKIE, '')
	})

	it('lets a service failure through', async () => {
		getUserById.mockRejectedValue(new Error('api down'))

		await expect(
			userLoader({ request: requestFor(), params: { id: 'user-1' } }),
		).rejects.toThrow('api down')
	})
})
