import { getLostItems } from './lost-items.service'
import { parsePostsFilters } from '../helpers/parse-posts-filters'
import { toLostItem } from '@/shared/mappers/lost-item.mapper'

export async function postsLoader({ request }: { request: Request }) {
	const filters = parsePostsFilters(new URL(request.url).searchParams)

	const response = await getLostItems(filters)

	return {
		listings: response.items.map(toLostItem),
		total: response.total,
		page: response.page,
		pageSize: response.pageSize,
	}
}
