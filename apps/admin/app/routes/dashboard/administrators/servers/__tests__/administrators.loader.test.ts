import type { Admin } from '../../types/administrators.types'

const { requireAdminSession, listAdminUsers } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listAdminUsers: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../administrators.service', () => ({ listAdminUsers }))

const { administratorsLoader } = await import('../administrators.loader')

function requestFor(headers: Record<string, string> = {}) {
	return new Request('http://localhost:3001/administrators', { headers })
}

const WITH_HEADERS = {
	cookie: 'retrouveci-admin.session_token=abc',
	origin: 'http://localhost:3001',
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listAdminUsers.mockReset().mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('administratorsLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor(WITH_HEADERS)

		await administratorsLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not list the administrators when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(
			administratorsLoader({ request: requestFor(WITH_HEADERS) }),
		).rejects.toBe(redirect)
		expect(listAdminUsers).not.toHaveBeenCalled()
	})

	/**
	 * `admin/list-users` reads the backoffice cookie and `SessionGuard` picks the
	 * instance from the `Origin`, so both have to be forwarded or the call comes
	 * back 401 against the public app's session.
	 */
	it('forwards the cookie and the origin to the service', async () => {
		await administratorsLoader({ request: requestFor(WITH_HEADERS) })

		expect(listAdminUsers).toHaveBeenCalledWith(WITH_HEADERS)
	})

	// A server-side call carries no Origin, and an empty string is what the
	// service must send rather than the literal `null` the header getter returns.
	it('sends empty strings when the request carries neither header', async () => {
		await administratorsLoader({ request: requestFor() })

		expect(listAdminUsers).toHaveBeenCalledWith({ cookie: '', origin: '' })
	})

	it('hands the list back under the key the page reads', async () => {
		const admins = [{ id: 'adm-1', name: 'Awa Traoré' } as Admin]
		listAdminUsers.mockResolvedValue(admins)

		expect(
			await administratorsLoader({ request: requestFor(WITH_HEADERS) }),
		).toEqual({ admins })
	})

	// A dead API must not be swallowed into an empty table: the page shows an
	// error boundary rather than "aucun administrateur".
	it('lets a service failure through', async () => {
		listAdminUsers.mockRejectedValue(new Error('api down'))

		await expect(
			administratorsLoader({ request: requestFor(WITH_HEADERS) }),
		).rejects.toThrow('api down')
	})
})
