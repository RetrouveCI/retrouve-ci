const {
	requireServerSession,
	getMyNotifications,
	getUnreadNotificationsCount,
} = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	getMyNotifications: vi.fn(),
	getUnreadNotificationsCount: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../notifications.service', () => ({
	getMyNotifications,
	getUnreadNotificationsCount,
}))

const { loader } = await import('../notifications.loader')

const request = () => new Request('http://localhost:3000/notifications')

const dto = (overrides: Record<string, unknown> = {}) => ({
	id: 'notif-1',
	type: 'match_found',
	title: 'Correspondance trouvée',
	message: 'Une annonce correspond à la vôtre.',
	link: '/posts/post-1',
	read: false,
	createdAt: '2026-08-01T10:00:00.000Z',
	...overrides,
})

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	getMyNotifications.mockReset().mockResolvedValue({ items: [], total: 0 })
	getUnreadNotificationsCount.mockReset().mockResolvedValue(0)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the notifications loader', () => {
	it('gates on the session before reading anything', async () => {
		const req = request()

		await loader({ request: req })

		expect(requireServerSession).toHaveBeenCalledWith(req)
	})

	it('does not read anything when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireServerSession.mockRejectedValue(redirect)

		await expect(loader({ request: request() })).rejects.toBe(redirect)
		expect(getMyNotifications).not.toHaveBeenCalled()
		expect(getUnreadNotificationsCount).not.toHaveBeenCalled()
	})

	// This is the whole point of the change: an account with no notifications
	// used to be shown six invented ones, linking to listings that do not exist.
	it('reports an empty account as no notification, inventing none', async () => {
		expect(await loader({ request: request() })).toEqual({
			items: [],
			unreadCount: 0,
		})
	})

	it('maps what the API returns', async () => {
		getMyNotifications.mockResolvedValue({
			items: [dto(), dto({ id: 'notif-2', read: true })],
			total: 2,
		})

		const { items } = await loader({ request: request() })

		expect(items.map(n => n.id)).toEqual(['notif-1', 'notif-2'])
		expect(items[0]).toMatchObject({
			title: 'Correspondance trouvée',
			link: '/posts/post-1',
			read: false,
		})
		expect(items[0]?.relativeDate).toBeTruthy()
	})

	it('reports the unread count the API gives', async () => {
		getUnreadNotificationsCount.mockResolvedValue(4)

		expect((await loader({ request: request() })).unreadCount).toBe(4)
	})

	it('reads both sources concurrently', async () => {
		const order: string[] = []
		getMyNotifications.mockImplementation(async () => {
			order.push('list:start')
			await Promise.resolve()
			order.push('list:end')
			return { items: [], total: 0 }
		})
		getUnreadNotificationsCount.mockImplementation(async () => {
			order.push('unread:start')
			return 0
		})

		await loader({ request: request() })

		expect(order.indexOf('unread:start')).toBeLessThan(
			order.indexOf('list:end'),
		)
	})

	// An outage is worth showing as one. It used to be hidden behind six
	// placeholder notifications, so the page looked healthy while it was not.
	it.each([
		['the list', () => getMyNotifications.mockRejectedValue(new Error('boom'))],
		[
			'the unread count',
			() => getUnreadNotificationsCount.mockRejectedValue(new Error('boom')),
		],
	])('lets a failure of %s through', async (_label, arrange) => {
		arrange()

		await expect(loader({ request: request() })).rejects.toThrow('boom')
	})
})

// The mocks must hoist above the import under test, so the module is loaded
// with `await import`. That needs the file to be a module (TS1375), and it has
// nothing else to import.
export {}
