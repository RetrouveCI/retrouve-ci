import { USER_STATUSES } from '../../types/users.types'

const { requireAdminSession, listUsers } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listUsers: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../users.service', () => ({ listUsers }))

const { usersLoader } = await import('../users.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/users${search}`, {
		headers: { cookie: 'retrouveci-admin.session_token=abc' },
	})

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listUsers.mockReset().mockResolvedValue({ users: [], total: 0 })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('usersLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await usersLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(usersLoader({ request: requestFor() })).rejects.toBe(redirect)
		expect(listUsers).not.toHaveBeenCalled()
	})

	it('forwards the session cookie to the service', async () => {
		await usersLoader({ request: requestFor() })

		expect(listUsers).toHaveBeenCalledWith(
			'retrouveci-admin.session_token=abc',
			undefined,
		)
	})

	it.each(USER_STATUSES)('forwards the %s filter', async status => {
		const result = await usersLoader({
			request: requestFor(`?status=${status}`),
		})

		expect(listUsers).toHaveBeenCalledWith(expect.any(String), status)
		expect(result.statusFilter).toBe(status)
	})

	it.each(['?status=banni', '?status=ACTIVE', '?status='])(
		'drops the status the list does not know in %s',
		async search => {
			await usersLoader({ request: requestFor(search) })

			expect(listUsers).toHaveBeenCalledWith(expect.any(String), undefined)
		},
	)

	it('reports no filter as all', async () => {
		const result = await usersLoader({ request: requestFor() })

		expect(result.statusFilter).toBe('all')
	})

	it('returns the users and the total the service reports', async () => {
		listUsers.mockResolvedValue({ users: [{ id: 'user-1' }], total: 1 })

		const result = await usersLoader({ request: requestFor() })

		expect(result.users).toEqual([{ id: 'user-1' }])
		expect(result.total).toBe(1)
	})
})
