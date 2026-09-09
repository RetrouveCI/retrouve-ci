import { getServerSession } from '@/shared/helpers/session.server'
import type { ActivitySummary } from '@/shared/types/activity'
import { getUnreadNotificationsCount } from '../../notifications/servers/notifications.service'
import { getMyStickerOrdersPage } from '../orders/servers/orders.service'
import { sweepMyLostItems } from '../posts/servers/account-posts.service'
import { getMyQrCodesPage } from '../stickers/servers/stickers.service'

/**
 * The account summary. It used to be a resource route behind a floating button,
 * `fetcher.load`ed so it would not cost every navigation a session round-trip.
 * R6 folded that panel into the account screen, which already has a loader and
 * already requires a session — so the summary rides along, and the client-side
 * fetch is gone.
 *
 * A failure resolves to `null`: the summary is a convenience, and the screen
 * renders without it rather than failing the page around it.
 */
export async function getActivitySummary(
	request: Request,
): Promise<ActivitySummary | null> {
	const session = await getServerSession(request)
	if (!session) return null

	try {
		const [posts, stickers, orders, unreadNotifications] = await Promise.all([
			sweepMyLostItems(request),
			getMyQrCodesPage(request),
			getMyStickerOrdersPage(request),
			getUnreadNotificationsCount(request),
		])

		return {
			posts: {
				total: posts.total,
				active: posts.items.filter(
					item =>
						item.resolutionStatus === 'active' &&
						item.moderationStatus === 'published',
				).length,
				pending: posts.items.filter(item => item.moderationStatus === 'pending')
					.length,
			},
			stickers: {
				total: stickers.total,
				activated: stickers.items.filter(i => i.status === 'activated').length,
			},
			orders: {
				total: orders.total,
				inProgress: orders.items.filter(
					i =>
						i.status === 'pending' ||
						i.status === 'processing' ||
						i.status === 'shipped',
				).length,
			},
			unreadNotifications,
		}
	} catch {
		return null
	}
}
