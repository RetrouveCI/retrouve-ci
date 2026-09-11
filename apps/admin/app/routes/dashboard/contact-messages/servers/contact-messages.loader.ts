import { redirect } from 'react-router'
import {
	CONTACT_MESSAGE_STATUSES,
	contactMessageStatusSchema,
} from '@app/contracts/contact-messages'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { countByStatus } from '@/shared/helpers/list-counts'
import {
	pastLastPage,
	readListPage,
	readSearch,
} from '@/shared/helpers/list-params'
import { listContactMessages } from './contact-messages.service'

export async function contactMessagesLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	// An unknown value in the query string means "no filter", not an error: the
	// page is reachable from a hand-edited URL.
	const status = contactMessageStatusSchema.safeParse(
		url.searchParams.get('status'),
	).data
	const search = readSearch(url.searchParams)
	const listPage = readListPage(url.searchParams)

	const [{ items, total }, counts] = await Promise.all([
		listContactMessages({ status, search, ...listPage }, request),
		countByStatus(CONTACT_MESSAGE_STATUSES, async probe => {
			const { total } = await listContactMessages(
				{ status: probe, search, page: 1, pageSize: 1 },
				request,
			)
			return total
		}),
	])

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return {
		messages: items,
		total,
		...listPage,
		search,
		statusFilter: status ?? 'all',
		counts,
	}
}
