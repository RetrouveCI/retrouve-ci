import { redirect } from 'react-router'
import { QR_TOKEN_STATUSES, qrTokenStatusSchema } from '@app/contracts/qr-codes'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { countByStatus } from '@/shared/helpers/list-counts'
import {
	pastLastPage,
	readDateRange,
	readListPage,
	readSearch,
} from '@/shared/helpers/list-params'
import { listQrTokens } from './qr.service'

export async function qrLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const status = qrTokenStatusSchema.safeParse(
		url.searchParams.get('status'),
	).data
	const search = readSearch(url.searchParams)
	const range = readDateRange(url.searchParams)
	const listPage = readListPage(url.searchParams)

	const [{ items, total }, counts] = await Promise.all([
		listQrTokens({ status, search, ...range, ...listPage }, request),
		// The probes carry the period too, or the pills would count a different
		// list from the one on screen — F9c's rule, one axis further.
		countByStatus(QR_TOKEN_STATUSES, async probe => {
			const { total } = await listQrTokens(
				{ status: probe, search, ...range, page: 1, pageSize: 1 },
				request,
			)
			return total
		}),
	])

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return {
		tokens: items,
		total,
		...listPage,
		search,
		...range,
		statusFilter: status ?? 'all',
		counts,
	}
}
