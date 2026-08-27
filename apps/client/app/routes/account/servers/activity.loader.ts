import { getServerSession } from '@/shared/helpers/session.server'
import type { ActivitySummary } from '@/shared/types/activity'
import { getUnreadNotificationsCount } from '../../notifications/servers/notifications.service'
import { getMyStickerOrdersPage } from '../orders/servers/orders.service'
import { getMyLostItemsPage } from '../posts/servers/account-posts.service'
import { getMyQrCodesPage } from '../stickers/servers/stickers.service'

export interface ActivityLoaderData {
	summary: ActivitySummary | null
}

/**
 * Resource route behind the floating activity button — `fetcher.load`ed rather
 * than served by the root loader, which would cost a session round-trip on every
 * navigation, for anonymous visitors included.
 *
 * A failure resolves to `null`: the summary is a convenience, and the button
 * already renders "Impossible de charger les données" for that case.
 */
export async function loader({
	request,
}: {
	request: Request
}): Promise<ActivityLoaderData> {
	const session = await getServerSession(request)
	if (!session) return { summary: null }

	try {
		const [posts, stickers, orders, unreadNotifications] = await Promise.all([
			getMyLostItemsPage(request),
			getMyQrCodesPage(request),
			getMyStickerOrdersPage(request),
			getUnreadNotificationsCount(request),
		])

		return {
			summary: {
				posts: {
					total: posts.total,
					active: posts.items.filter(
						item =>
							item.resolutionStatus === 'active' &&
							item.moderationStatus === 'published',
					).length,
					pending: posts.items.filter(
						item => item.moderationStatus === 'pending',
					).length,
				},
				stickers: {
					total: stickers.total,
					activated: stickers.items.filter(i => i.status === 'activated')
						.length,
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
			},
		}
	} catch {
		return { summary: null }
	}
}
