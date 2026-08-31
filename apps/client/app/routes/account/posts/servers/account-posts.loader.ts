import { redirect } from 'react-router'
import { requireServerSession } from '@/shared/helpers/session.server'
import { toUserLostItem } from '@/shared/mappers/lost-item.mapper'
import { parseAccountPostsFilters } from '../helpers/parse-account-posts-filters'
import { getMyLostItemsPage } from './account-posts.service'

export async function accountPostsLoader({ request }: { request: Request }) {
	await requireServerSession(request)

	const filters = parseAccountPostsFilters(new URL(request.url).searchParams)

	const response = await getMyLostItemsPage(request, filters)

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
	}
}

function clampedUrl(request: Request, page: number): string {
	const url = new URL(request.url)

	if (page > 1) url.searchParams.set('page', String(page))
	else url.searchParams.delete('page')

	return `${url.pathname}${url.search}`
}
