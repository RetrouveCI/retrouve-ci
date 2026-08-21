import { notificationReadSchema } from '@app/contracts/notifications'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listNotifications } from './notifications.service'

export async function notificationsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawRead = url.searchParams.get('read')
	const parsedRead = notificationReadSchema.safeParse(rawRead)
	const readFilter = parsedRead.success ? parsedRead.data : undefined

	const { items, total } = await listNotifications(
		{ read: readFilter },
		request,
	)

	return { notifications: items, total, readFilter: rawRead ?? 'all' }
}
