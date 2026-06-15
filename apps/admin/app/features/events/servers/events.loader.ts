import { requireAdminSession } from '@/shared/auth/auth.server'
import { listEvents } from './events.service'
import type { EventStatus } from '../events.types'

const VALID_STATUSES: EventStatus[] = ['draft', 'published', 'cancelled']

export async function eventsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const status = VALID_STATUSES.includes(rawStatus as EventStatus)
		? (rawStatus as EventStatus)
		: undefined

	const { items, total } = await listEvents({ status }, request)

	return { events: items, total, statusFilter: rawStatus ?? 'all' }
}
