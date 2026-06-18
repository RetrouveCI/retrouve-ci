import { NotificationsPage } from './components/notifications-page'
import type { Route } from './+types/index'

export { loader } from './servers/notifications.loader'
export { action } from './servers/notifications.action'

export default function Notifications({ loaderData }: Route.ComponentProps) {
	return (
		<NotificationsPage
			items={loaderData.items}
			unreadCount={loaderData.unreadCount}
		/>
	)
}
