import { requireAdminSession } from '@/shared/helpers/session.server'
import type { LayoutCounts } from '@/shared/types/dashboard'
import { getUnreadCount } from '../notifications/servers/notifications.service'

const SIDEBAR_COLLAPSED = /(?:^|;\s*)sidebar_collapsed=1(?:;|$)/

export async function dashboardLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	return {
		sidebarCollapsed: SIDEBAR_COLLAPSED.test(
			request.headers.get('cookie') ?? '',
		),
		counts: await readCounts(request),
	}
}

// A badge must never take the shell down, so an unreachable counter reads zero.
async function readCounts(request: Request): Promise<LayoutCounts> {
	try {
		return { notificationsUnread: await getUnreadCount(request) }
	} catch {
		return { notificationsUnread: 0 }
	}
}
