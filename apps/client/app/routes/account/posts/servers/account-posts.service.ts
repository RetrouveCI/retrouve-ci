import type { UpdateLostItemInput } from '@app/contracts/lost-items'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	LostItemApiDto,
	LostItemListApiResponse,
} from '@/shared/types/lost-items.types'
import type { LostItemStatus } from '@/shared/types/lost-item'

/** The PATCH body is the contract's own input, minus the resolution status. */
export type PatchLostItemPayload = Omit<UpdateLostItemInput, 'resolutionStatus'>

export async function getMyLostItemsPage(
	request: Request,
): Promise<LostItemListApiResponse> {
	return apiFetch<LostItemListApiResponse>('/lost-items/mine?pageSize=50', {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function getMyLostItems(
	request: Request,
): Promise<LostItemApiDto[]> {
	return (await getMyLostItemsPage(request)).items
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
