import type {
	MyLostItemsFilterData,
	UpdateLostItemInput,
} from '@app/contracts/lost-items'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	LostItemApiDto,
	LostItemListApiResponse,
} from '@/shared/types/lost-items.types'
import type { LostItemStatus } from '@/shared/types/lost-item'

/** The PATCH body is the contract's own input, minus the resolution status. */
export type PatchLostItemPayload = Omit<UpdateLostItemInput, 'resolutionStatus'>

/**
 * The ceiling the three screens that still read every listing at once live
 * under: the account overview, its activity summary and the edit loader.
 */
const SWEEP_PAGE_SIZE = 50

/** One page of the visitor's own listings, filtered as the URL asked. */
export async function getMyLostItemsPage(
	request: Request,
	filter: MyLostItemsFilterData,
): Promise<LostItemListApiResponse> {
	const params = new URLSearchParams()
	if (filter.search) params.set('search', filter.search)
	if (filter.resolutionStatus)
		params.set('resolutionStatus', filter.resolutionStatus)
	params.set('page', String(filter.page))
	params.set('pageSize', String(filter.pageSize))

	return apiFetch<LostItemListApiResponse>(
		`/lost-items/mine?${params.toString()}`,
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
}

/** Every listing in one call, up to `SWEEP_PAGE_SIZE`. */
export async function sweepMyLostItems(
	request: Request,
): Promise<LostItemListApiResponse> {
	return getMyLostItemsPage(request, { page: 1, pageSize: SWEEP_PAGE_SIZE })
}

export async function getMyLostItems(
	request: Request,
): Promise<LostItemApiDto[]> {
	return (await sweepMyLostItems(request)).items
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
