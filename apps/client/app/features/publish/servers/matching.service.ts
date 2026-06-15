import { apiFetch } from '@/shared/lib/api-client'
import type {
	LostItemApiDto,
	LostItemListApiResponse,
} from '../../lost-items/lost-items.types'
import type { LostItemType } from '@/shared/types/lost-item'

const MAX_MATCHES = 4

export interface FindMatchingLostItemsParams {
	type: LostItemType
	category: string
	ville: string
}

export async function findMatchingLostItems({
	type,
	category,
	ville,
}: FindMatchingLostItemsParams): Promise<LostItemApiDto[]> {
	const params = new URLSearchParams({
		type,
		category,
		ville,
		pageSize: String(MAX_MATCHES),
	})

	const response = await apiFetch<LostItemListApiResponse>(
		`/lost-items?${params}`,
	)

	return response.items
}
