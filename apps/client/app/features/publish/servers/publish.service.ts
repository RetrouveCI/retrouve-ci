import { apiFetch } from '@/shared/utils/api-fetch'
import type { LostItemApiDto } from '../../lost-items/lost-items.types'
import type { CreateLostItemPayload } from '../publish.types'

export async function createLostItem(
	payload: CreateLostItemPayload,
	request: Request,
): Promise<LostItemApiDto> {
	return apiFetch<LostItemApiDto>('/lost-items', {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
