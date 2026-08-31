import type { ActivitySummary } from '@/shared/types/activity'

const {
	getServerSession,
	sweepMyLostItems,
	getMyQrCodesPage,
	getMyStickerOrdersPage,
	getUnreadNotificationsCount,
} = vi.hoisted(() => ({
	getServerSession: vi.fn(),
	sweepMyLostItems: vi.fn(),
	getMyQrCodesPage: vi.fn(),
	getMyStickerOrdersPage: vi.fn(),
	getUnreadNotificationsCount: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../../posts/servers/account-posts.service', () => ({
	sweepMyLostItems,
}))
vi.mock('../../stickers/servers/stickers.service', () => ({ getMyQrCodesPage }))
vi.mock('../../orders/servers/orders.service', () => ({
	getMyStickerOrdersPage,
}))
vi.mock('../../../notifications/servers/notifications.service', () => ({
	getUnreadNotificationsCount,
}))

const { getActivitySummary } = await import('../activity.service')

const request = () => new Request('http://localhost:3000/account')

const item = (
	moderationStatus: string,
	resolutionStatus: string,
): Record<string, unknown> => ({ moderationStatus, resolutionStatus })

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	sweepMyLostItems.mockReset().mockResolvedValue({ items: [], total: 0 })
	getMyQrCodesPage.mockReset().mockResolvedValue({ items: [], total: 0 })
	getMyStickerOrdersPage.mockReset().mockResolvedValue({ items: [], total: 0 })
	getUnreadNotificationsCount.mockReset().mockResolvedValue(0)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('getActivitySummary', () => {
	// The summary is a convenience on a screen that gates itself: an anonymous
	// visitor must get an answer, not a redirect, and must cost no API call.
	it('answers with no summary for an anonymous visitor, and reads nothing', async () => {
		getServerSession.mockResolvedValue(null)

		expect(await getActivitySummary(request())).toBeNull()
		expect(sweepMyLostItems).not.toHaveBeenCalled()
		expect(getMyQrCodesPage).not.toHaveBeenCalled()
		expect(getMyStickerOrdersPage).not.toHaveBeenCalled()
		expect(getUnreadNotificationsCount).not.toHaveBeenCalled()
	})

	it('reports the unread count the API gives', async () => {
		getUnreadNotificationsCount.mockResolvedValue(4)

		const summary = await getActivitySummary(request())

		expect(summary?.unreadNotifications).toBe(4)
	})

	it('counts active posts as published *and* unresolved', async () => {
		sweepMyLostItems.mockResolvedValue({
			total: 4,
			items: [
				item('published', 'active'),
				item('published', 'resolved'),
				item('pending', 'active'),
				item('rejected', 'active'),
			],
		})

		const summary = await getActivitySummary(request())

		const expected: ActivitySummary['posts'] = {
			total: 4,
			active: 1,
			pending: 1,
		}
		expect(summary?.posts).toEqual(expected)
	})

	// `total` is the API's count, not the page length — the page is capped at 50.
	it('takes the total from the API rather than the returned page', async () => {
		sweepMyLostItems.mockResolvedValue({
			total: 137,
			items: [item('published', 'active')],
		})

		const summary = await getActivitySummary(request())

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

		const summary = await getActivitySummary(request())

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

		const summary = await getActivitySummary(request())

		const expected: ActivitySummary['orders'] = { total: 5, inProgress: 3 }
		expect(summary?.orders).toEqual(expected)
	})

	it('reads every source concurrently', async () => {
		const order: string[] = []
		sweepMyLostItems.mockImplementation(async () => {
			order.push('posts:start')
			await Promise.resolve()
			order.push('posts:end')
			return { items: [], total: 0 }
		})
		getUnreadNotificationsCount.mockImplementation(async () => {
			order.push('unread:start')
			return 0
		})

		await getActivitySummary(request())

		// The second call starts before the first resolves.
		expect(order.indexOf('unread:start')).toBeLessThan(
			order.indexOf('posts:end'),
		)
	})

	// A convenience panel must not surface as a broken route.
	it.each([
		['posts', () => sweepMyLostItems.mockRejectedValue(new Error('boom'))],
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

		expect(await getActivitySummary(request())).toBeNull()
	})
})
