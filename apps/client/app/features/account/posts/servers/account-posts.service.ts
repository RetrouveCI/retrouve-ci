import { apiFetch } from '@/shared/lib/api-client'
import type {
	LostItemApiDto,
	LostItemListApiResponse,
} from '@/features/lost-items/lost-items.types'
import type { LostItemStatus } from '@/shared/types/lost-item'

export interface PatchLostItemPayload {
	title?: string
	description?: string
	ville?: string
	commune?: string
	eventDate?: string
	contactName?: string
	contactWhatsapp?: string
	photos?: string[]
}

export async function getMyLostItems(
	request: Request,
): Promise<LostItemApiDto[]> {
	const response = await apiFetch<LostItemListApiResponse>(
		'/lost-items/mine?pageSize=50',
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
	return response.items
}

export async function deleteLostItem(
	id: string,
	request: Request,
): Promise<void> {
	await apiFetch(`/lost-items/${id}`, {
		method: 'DELETE',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function patchLostItemContent(
	id: string,
	payload: PatchLostItemPayload,
	request: Request,
): Promise<void> {
	await apiFetch(`/lost-items/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function updateLostItemResolution(
	id: string,
	resolutionStatus: LostItemStatus,
	request: Request,
): Promise<void> {
	await apiFetch(`/lost-items/${id}`, {
		method: 'PATCH',
		body: JSON.stringify({ resolutionStatus }),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
