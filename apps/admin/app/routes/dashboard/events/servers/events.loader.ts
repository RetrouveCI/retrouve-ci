import { eventStatusSchema } from '@app/contracts/events'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listEvents } from './events.service'

export async function eventsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const parsedStatus = eventStatusSchema.safeParse(rawStatus)
	const status = parsedStatus.success ? parsedStatus.data : undefined

	const { items, total } = await listEvents({ status }, request)

	return { events: items, total, statusFilter: rawStatus ?? 'all' }
}
