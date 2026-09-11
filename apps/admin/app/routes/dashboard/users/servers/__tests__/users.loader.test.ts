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

	// The request itself, not a cookie string: that is what carries the caller
	// address the API's rate limiter keys on (R50).
	it('hands the request down to the service', async () => {
		const request = requestFor()

		await usersLoader({ request })

		expect(listUsers).toHaveBeenCalledWith(expect.anything(), request)
	})

	// It used to ask for 500 accounts and page them in the browser.
	it('asks for the first page by default', async () => {
		await usersLoader({ request: requestFor() })

		expect(listUsers).toHaveBeenCalledWith(
			{ page: 1, pageSize: 25, search: undefined },
			expect.any(Request),
		)
	})

	it('forwards the page, the size and the search the URL carries', async () => {
		listUsers.mockResolvedValue({ users: [], total: 500 })

		await usersLoader({
			request: requestFor('?page=3&pageSize=50&q=%20Konan%20'),
		})

		expect(listUsers).toHaveBeenCalledWith(
			{ page: 3, pageSize: 50, search: 'Konan' },
			expect.any(Request),
		)
	})

	it('sends a page past the end back to the last one', async () => {
		listUsers.mockResolvedValue({ users: [], total: 30 })

		const thrown = await usersLoader({
			request: requestFor('?page=9'),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe('/users?page=2')
	})

	it('returns the users and the total the service reports', async () => {
		listUsers.mockResolvedValue({ users: [{ id: 'user-1' }], total: 1 })

		const result = await usersLoader({ request: requestFor() })

		expect(result.users).toEqual([{ id: 'user-1' }])
		expect(result.total).toBe(1)
	})
})

// The mocks hoist above the import under test, so the file must be a module.
export {}
