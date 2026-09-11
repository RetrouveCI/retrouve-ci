import { redirect } from 'react-router'
import { notificationReadSchema } from '@app/contracts/notifications'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { countByStatus } from '@/shared/helpers/list-counts'
import { pastLastPage, readListPage } from '@/shared/helpers/list-params'
import {
	getPushSubscriptionCount,
	listNotifications,
} from './notifications.service'

const READ_STATES = ['unread', 'read'] as const

export async function notificationsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	// The contract refuses what is neither `true` nor `false`, where the API's
	// old DTO read it as `false`: an unreadable filter means no filter.
	const read = notificationReadSchema.safeParse(
		url.searchParams.get('read'),
	).data
	const listPage = readListPage(url.searchParams)

	const [{ items, total }, counts, pushDevices] = await Promise.all([
		listNotifications({ read, ...listPage }, request),
		countByStatus(READ_STATES, async state => {
			const { total } = await listNotifications(
				{
					read: state === undefined ? undefined : state === 'read',
					page: 1,
					pageSize: 1,
				},
				request,
			)
			return total
		}),
		readPushDevices(request),
	])

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return { notifications: items, total, ...listPage, counts, pushDevices }
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
