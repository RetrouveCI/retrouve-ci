import { getLostItems } from './lost-items.service'
import { toLostItem } from '../../mappers/lost-item.mapper'

export const POSTS_PAGE_SIZE = 12

export async function postsLoader({ request }: { request: Request }) {
	const params = new URL(request.url).searchParams
	const page = Number(params.get('page')) || 1

	const response = await getLostItems({
		search: params.get('q') ?? undefined,
		type: params.get('type') ?? undefined,
		category: params.get('category') ?? undefined,
		ville: params.get('ville') ?? undefined,
		commune: params.get('commune') ?? undefined,
		dateFrom: params.get('dateFrom') ?? undefined,
		dateTo: params.get('dateTo') ?? undefined,
		page,
		pageSize: POSTS_PAGE_SIZE,
	})

	return {
		listings: response.items.map(toLostItem),
		total: response.total,
		page: response.page,
		pageSize: response.pageSize,
	}
}
