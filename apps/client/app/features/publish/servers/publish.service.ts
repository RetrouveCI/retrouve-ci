import { apiFetch } from '@/shared/lib/api-client'
import type { LostItemApiDto } from '../../lost-items/lost-items.types'
import type { CreateLostItemPayload } from '../publish.types'

export async function createLostItem(
	payload: CreateLostItemPayload,
): Promise<LostItemApiDto> {
	return apiFetch<LostItemApiDto>('/lost-items', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
}
