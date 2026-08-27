import type { ActivitySummary } from '@/shared/types/activity'

const {
	getServerSession,
	getMyLostItemsPage,
	getMyQrCodesPage,
	getMyStickerOrdersPage,
	getUnreadNotificationsCount,
} = vi.hoisted(() => ({
	getServerSession: vi.fn(),
	getMyLostItemsPage: vi.fn(),
	getMyQrCodesPage: vi.fn(),
	getMyStickerOrdersPage: vi.fn(),
	getUnreadNotificationsCount: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../../posts/servers/account-posts.service', () => ({
	getMyLostItemsPage,
}))
vi.mock('../../stickers/servers/stickers.service', () => ({ getMyQrCodesPage }))
vi.mock('../../orders/servers/orders.service', () => ({
	getMyStickerOrdersPage,
}))
vi.mock('../../../notifications/servers/notifications.service', () => ({
	getUnreadNotificationsCount,
}))

const { loader } = await import('../activity.loader')

const request = () => new Request('http://localhost:3000/account/activity')

const item = (
	moderationStatus: string,
	resolutionStatus: string,
): Record<string, unknown> => ({ moderationStatus, resolutionStatus })

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	getMyLostItemsPage.mockReset().mockResolvedValue({ items: [], total: 0 })
	getMyQrCodesPage.mockReset().mockResolvedValue({ items: [], total: 0 })
	getMyStickerOrdersPage.mockReset().mockResolvedValue({ items: [], total: 0 })
	getUnreadNotificationsCount.mockReset().mockResolvedValue(0)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the activity loader', () => {
	// The button is background furniture: an anonymous visitor must get an answer,
	// not a redirect.
	it('answers with no summary for an anonymous visitor, and reads nothing', async () => {
		getServerSession.mockResolvedValue(null)

		expect(await loader({ request: request() })).toEqual({ summary: null })
		expect(getMyLostItemsPage).not.toHaveBeenCalled()
		expect(getMyQrCodesPage).not.toHaveBeenCalled()
		expect(getMyStickerOrdersPage).not.toHaveBeenCalled()
		expect(getUnreadNotificationsCount).not.toHaveBeenCalled()
	})

	it('reports the unread count the API gives', async () => {
		getUnreadNotificationsCount.mockResolvedValue(4)

		const { summary } = await loader({ request: request() })

		expect(summary?.unreadNotifications).toBe(4)
	})

	it('counts active posts as published *and* unresolved', async () => {
		getMyLostItemsPage.mockResolvedValue({
			total: 4,
			items: [
				item('published', 'active'),
				item('published', 'resolved'),
				item('pending', 'active'),
				item('rejected', 'active'),
			],
		})

		const { summary } = await loader({ request: request() })

		const expected: ActivitySummary['posts'] = {
			total: 4,
			active: 1,
			pending: 1,
		}
		expect(summary?.posts).toEqual(expected)
	})

	// `total` is the API's count, not the page length — the page is capped at 50.
	it('takes the total from the API rather than the returned page', async () => {
		getMyLostItemsPage.mockResolvedValue({
			total: 137,
			items: [item('published', 'active')],
		})

		const { summary } = await loader({ request: request() })

		expect(summary?.posts.total).toBe(137)
	})

	// Only an activated sticker is "actif"; a generated or revoked one is not.
	it('counts activated stickers, and takes the total from the API', async () => {
		getMyQrCodesPage.mockResolvedValue({
			total: 12,
			items: [
				{ status: 'activated' },
				{ status: 'activated' },
				{ status: 'generated' },
				{ status: 'revoked' },
			],
		})

		const { summary } = await loader({ request: request() })

		const expected: ActivitySummary['stickers'] = { total: 12, activated: 2 }
		expect(summary?.stickers).toEqual(expected)
	})

	// "En cours" is everything before delivery: a delivered or cancelled order is
	// done, and must not keep the button's dot lit.
	it('counts orders in progress as pending, processing or shipped', async () => {
		getMyStickerOrdersPage.mockResolvedValue({
			total: 5,
			items: [
				{ status: 'pending' },
				{ status: 'processing' },
				{ status: 'shipped' },
				{ status: 'delivered' },
				{ status: 'cancelled' },
			],
		})

		const { summary } = await loader({ request: request() })

		const expected: ActivitySummary['orders'] = { total: 5, inProgress: 3 }
		expect(summary?.orders).toEqual(expected)
	})

	it('reads every source concurrently', async () => {
		const order: string[] = []
		getMyLostItemsPage.mockImplementation(async () => {
			order.push('posts:start')
			await Promise.resolve()
			order.push('posts:end')
			return { items: [], total: 0 }
		})
		getUnreadNotificationsCount.mockImplementation(async () => {
			order.push('unread:start')
			return 0
		})

		await loader({ request: request() })

		// The second call starts before the first resolves.
		expect(order.indexOf('unread:start')).toBeLessThan(
			order.indexOf('posts:end'),
		)
	})

	// A convenience panel must not surface as a broken route.
	it.each([
		['posts', () => getMyLostItemsPage.mockRejectedValue(new Error('boom'))],
		['stickers', () => getMyQrCodesPage.mockRejectedValue(new Error('boom'))],
		[
			'orders',
			() => getMyStickerOrdersPage.mockRejectedValue(new Error('boom')),
		],
		[
			'the unread count',
			() => getUnreadNotificationsCount.mockRejectedValue(new Error('boom')),
		],
	])('answers with no summary when %s fails', async (_label, arrange) => {
		arrange()

		expect(await loader({ request: request() })).toEqual({ summary: null })
	})
})
