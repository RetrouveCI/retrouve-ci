import { requireServerSession } from '@/shared/auth/auth.server'
import { toNotification } from '../mappers/notification.mapper'
import {
	getMyNotifications,
	getUnreadNotificationsCount,
} from './notifications.service'

export async function loader({ request }: { request: Request }) {
	await requireServerSession(request)

	const [list, unreadCount] = await Promise.all([
		getMyNotifications(request),
		getUnreadNotificationsCount(request),
	])

	return { items: list.items.map(toNotification), unreadCount }
}
