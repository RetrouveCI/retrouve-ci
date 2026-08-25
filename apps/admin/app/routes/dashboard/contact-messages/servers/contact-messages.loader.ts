import { contactMessageStatusSchema } from '@app/contracts/contact-messages'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listContactMessages } from './contact-messages.service'

export async function contactMessagesLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')

	// An unknown value in the query string means "no filter", not an error: the
	// page is reachable from a hand-edited URL.
	const status = contactMessageStatusSchema.safeParse(rawStatus).data

	const { items, total } = await listContactMessages({ status }, request)

	return { messages: items, total, statusFilter: rawStatus ?? 'all' }
}
