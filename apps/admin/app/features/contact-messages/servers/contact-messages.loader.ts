import { requireAdminSession } from '@/shared/auth/auth.server'
import { listContactMessages } from './contact-messages.service'
import type { ContactMessageStatus } from '../contact-messages.types'

const VALID_STATUSES: ContactMessageStatus[] = ['new', 'read', 'archived']

export async function contactMessagesLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const status = VALID_STATUSES.includes(rawStatus as ContactMessageStatus)
		? (rawStatus as ContactMessageStatus)
		: undefined

	const { items, total } = await listContactMessages({ status }, request)

	return { messages: items, total, statusFilter: rawStatus ?? 'all' }
}
