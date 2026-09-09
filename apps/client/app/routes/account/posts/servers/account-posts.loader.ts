import { redirect } from 'react-router'
import { requireServerSession } from '@/shared/helpers/session.server'
import { toUserLostItem } from '@/shared/mappers/lost-item.mapper'
import type { MyLostItemsSummaryApiResponse } from '@/shared/types/lost-items.types'
import { parseAccountPostsFilters } from '../helpers/parse-account-posts-filters'
import {
	getMyLostItemsPage,
	getMyLostItemsSummary,
} from './account-posts.service'

/** A counter the API cannot serve reads zero: a badge must not take a page down. */
const EMPTY_SUMMARY: MyLostItemsSummaryApiResponse = {
	total: 0,
	lifecycle: { active: 0, resolved: 0, expired: 0 },
	moderation: { pending: 0, published: 0, hidden: 0 },
}

export async function accountPostsLoader({ request }: { request: Request }) {
	await requireServerSession(request)

	const filters = parseAccountPostsFilters(new URL(request.url).searchParams)

	const [response, summary] = await Promise.all([
		getMyLostItemsPage(request, filters),
		getMyLostItemsSummary(request).catch(() => EMPTY_SUMMARY),
	])

	/**
	 * Deleting the last listing of a last page leaves `?page=3` pointing past a
	 * two-page list. The address is the state, so the address gets corrected.
	 */
	const lastPage = Math.max(1, Math.ceil(response.total / filters.pageSize))
	if (filters.page > lastPage) throw redirect(clampedUrl(request, lastPage))

	return {
		listings: response.items.map(toUserLostItem),
		total: response.total,
		page: response.page,
		pageSize: response.pageSize,
		summary,
	}
}

function clampedUrl(request: Request, page: number): string {
	const url = new URL(request.url)

	if (page > 1) url.searchParams.set('page', String(page))
	else url.searchParams.delete('page')

	return `${url.pathname}${url.search}`
}
