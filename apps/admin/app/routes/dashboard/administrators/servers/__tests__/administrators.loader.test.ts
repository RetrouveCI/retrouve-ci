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

	// The request travels whole, so both the cookie `admin/list-users` reads and
	// the address the limiter keys on arrive: pulling the two out by hand is what
	// left this call speaking for the container (R50).
	it('hands the request down to the service', async () => {
		const request = requestFor(WITH_HEADERS)

		await administratorsLoader({ request })

		expect(listAdminUsers).toHaveBeenCalledWith(request)
	})

	it('hands it down even when it carries no cookie of its own', async () => {
		const request = requestFor()

		await administratorsLoader({ request })

		expect(listAdminUsers).toHaveBeenCalledWith(request)
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
