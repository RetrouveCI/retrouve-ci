import { redirect } from 'react-router'
import {
	STICKER_ORDER_STATUSES,
	stickerOrderStatusSchema,
} from '@app/contracts/sticker-orders'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { countByStatus } from '@/shared/helpers/list-counts'
import {
	pastLastPage,
	readListPage,
	readSearch,
} from '@/shared/helpers/list-params'
import { listOrders } from './orders.service'

export async function ordersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	// An unknown status means « no filter », not an error: the URL is editable.
	const status = stickerOrderStatusSchema.safeParse(
		url.searchParams.get('status'),
	).data
	const search = readSearch(url.searchParams)
	const listPage = readListPage(url.searchParams)

	const [{ items, total }, counts] = await Promise.all([
		listOrders({ status, search, ...listPage }, request),
		countByStatus(STICKER_ORDER_STATUSES, async probe => {
			const { total } = await listOrders(
				{ status: probe, search, page: 1, pageSize: 1 },
				request,
			)
			return total
		}),
	])

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return {
		orders: items,
		total,
		...listPage,
		search,
		statusFilter: status ?? 'all',
		counts,
	}
}
