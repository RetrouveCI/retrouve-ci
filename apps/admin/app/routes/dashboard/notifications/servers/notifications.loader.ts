import { notificationReadSchema } from '@app/contracts/notifications'
import { requireAdminSession } from '@/shared/helpers/session.server'
import {
	getPushSubscriptionCount,
	listNotifications,
} from './notifications.service'

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

	return {
		notifications: items,
		total,
		readFilter: rawRead ?? 'all',
		pushDevices: await readPushDevices(request),
	}
}

// A figure must never take the page down, so an unreachable counter reads null
// — and the card then says so rather than announcing a zero.
async function readPushDevices(request: Request): Promise<number | null> {
	try {
		return await getPushSubscriptionCount(request)
	} catch {
		return null
	}
}
