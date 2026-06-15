import { requireAdminSession } from '@/shared/auth/auth.server'
import { listNotifications } from './notifications.service'

export async function notificationsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawRead = url.searchParams.get('read')
	const readFilter =
		rawRead === 'true' ? true : rawRead === 'false' ? false : undefined

	const { items, total } = await listNotifications({ read: readFilter }, request)

	return { notifications: items, total, readFilter: rawRead ?? 'all' }
}
