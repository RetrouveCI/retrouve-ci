import { NotificationsPage } from './components/notifications-page'
import type { Route } from './+types/_index'
import { pageMeta } from '@/shared/helpers/page-meta'

export function meta() {
	return pageMeta({
		title: 'Notifications',
		description: 'Vos alertes de correspondance et vos messages.',
	})
}

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
