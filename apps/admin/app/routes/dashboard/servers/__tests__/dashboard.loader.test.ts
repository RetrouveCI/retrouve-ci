import { ApiError } from '@/shared/utils/api-fetch'

const { requireAdminSession, getUnreadCount } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getUnreadCount: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../../notifications/servers/notifications.service', () => ({
	getUnreadCount,
}))

const { dashboardLoader } = await import('../dashboard.loader')

const requestWith = (cookie?: string) =>
	new Request('http://localhost:3001/', {
		headers: cookie ? { cookie } : {},
	})

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	getUnreadCount.mockReset().mockResolvedValue({ count: 7 })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('dashboardLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestWith()

		await dashboardLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the counter when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(dashboardLoader({ request: requestWith() })).rejects.toBe(
			redirect,
		)
		expect(getUnreadCount).not.toHaveBeenCalled()
	})

	it('returns the unread count the API reports', async () => {
		const { counts } = await dashboardLoader({ request: requestWith() })

		expect(counts).toEqual({ notificationsUnread: 7 })
	})

	// The badge is decoration; the shell is not. A counter the API cannot serve
	// must never take the whole dashboard down.
	it('reads zero rather than throwing when the counter is unreachable', async () => {
		getUnreadCount.mockRejectedValue(new ApiError(500, 'Erreur serveur'))

		const { counts } = await dashboardLoader({ request: requestWith() })

		expect(counts).toEqual({ notificationsUnread: 0 })
	})

	it('survives a counter that fails outside of an ApiError', async () => {
		getUnreadCount.mockRejectedValue(new TypeError('fetch failed'))

		const { counts } = await dashboardLoader({ request: requestWith() })

		expect(counts).toEqual({ notificationsUnread: 0 })
	})

	describe('the sidebar cookie', () => {
		it('reads collapsed only when the flag is set to 1', async () => {
			const read = async (cookie?: string) =>
				(await dashboardLoader({ request: requestWith(cookie) }))
					.sidebarCollapsed

			expect(await read()).toBe(false)
			expect(await read('sidebar_collapsed=1')).toBe(true)
			expect(await read('sidebar_collapsed=0')).toBe(false)
		})

		it('finds the flag among other cookies, and is not fooled by a suffix', async () => {
			const read = async (cookie: string) =>
				(await dashboardLoader({ request: requestWith(cookie) }))
					.sidebarCollapsed

			expect(await read('theme=dark; sidebar_collapsed=1')).toBe(true)
			expect(await read('sidebar_collapsed=1; theme=dark')).toBe(true)
			expect(await read('not_sidebar_collapsed=1')).toBe(false)
			expect(await read('sidebar_collapsed=11')).toBe(false)
		})
	})
})
