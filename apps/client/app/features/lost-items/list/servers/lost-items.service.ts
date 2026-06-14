import { apiFetch } from '@/shared/lib/api-client'
import type {
	LostItemApiDto,
	LostItemListApiResponse,
} from '../../lost-items.types'

export async function getLostItems(): Promise<LostItemApiDto[]> {
	const response = await apiFetch<LostItemListApiResponse>(
		'/lost-items?pageSize=50',
	)
	return response.items
}

export async function getLostItemById(id: string): Promise<LostItemApiDto> {
	return apiFetch<LostItemApiDto>(`/lost-items/${id}`)
}
