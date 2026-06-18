import { apiFetch } from '@/shared/lib/api-client'
import type {
	LostItemApiDto,
	LostItemListApiResponse,
} from '../../lost-items.types'

export interface PostsQuery {
	search?: string
	type?: string
	category?: string
	ville?: string
	commune?: string
	dateFrom?: string
	dateTo?: string
	page?: number
	pageSize?: number
}

export async function getLostItems(
	query: PostsQuery = {},
): Promise<LostItemListApiResponse> {
	const params = new URLSearchParams()
	if (query.search) params.set('search', query.search)
	if (query.type) params.set('type', query.type)
	if (query.category) params.set('category', query.category)
	if (query.ville) params.set('ville', query.ville)
	if (query.commune) params.set('commune', query.commune)
	if (query.dateFrom) params.set('dateFrom', query.dateFrom)
	if (query.dateTo) params.set('dateTo', query.dateTo)
	params.set('page', String(query.page ?? 1))
	params.set('pageSize', String(query.pageSize ?? 12))

	return apiFetch<LostItemListApiResponse>(`/lost-items?${params.toString()}`)
}

export async function getLostItemById(id: string): Promise<LostItemApiDto> {
	return apiFetch<LostItemApiDto>(`/lost-items/${id}`)
}
