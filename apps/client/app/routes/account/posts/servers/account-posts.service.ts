import type {
	MyLostItemsFilterData,
	UpdateLostItemInput,
} from '@app/contracts/lost-items'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	MyLostItemApiDto,
	MyLostItemListApiResponse,
	MyLostItemsSummaryApiResponse,
} from '@/shared/types/lost-items.types'
import type { LostItemStatus } from '@/shared/types/lost-item'
import type { ListingComment, UnreadThread } from '../types/thread'

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
): Promise<MyLostItemListApiResponse> {
	const params = new URLSearchParams()
	if (filter.search) params.set('search', filter.search)
	if (filter.resolutionStatus)
		params.set('resolutionStatus', filter.resolutionStatus)
	params.set('page', String(filter.page))
	params.set('pageSize', String(filter.pageSize))

	return apiFetch<MyLostItemListApiResponse>(
		`/lost-items/mine?${params.toString()}`,
		{ request },
	)
}

/** The counts the filter pills and the moderation banner read. */
export async function getMyLostItemsSummary(
	request: Request,
): Promise<MyLostItemsSummaryApiResponse> {
	return apiFetch<MyLostItemsSummaryApiResponse>('/lost-items/mine/summary', {
		request,
	})
}

/** Every listing in one call, up to `SWEEP_PAGE_SIZE`. */
export async function sweepMyLostItems(
	request: Request,
): Promise<MyLostItemListApiResponse> {
	return getMyLostItemsPage(request, { page: 1, pageSize: SWEEP_PAGE_SIZE })
}

export async function getMyLostItems(
	request: Request,
): Promise<MyLostItemApiDto[]> {
	return (await sweepMyLostItems(request)).items
}

export async function deleteLostItem(
	id: string,
	request: Request,
): Promise<void> {
	await apiFetch(`/lost-items/${id}`, {
		method: 'DELETE',
		request,
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
		request,
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
		request,
	})
}

export async function getListingThread(
	id: string,
	request: Request,
): Promise<ListingComment[]> {
	return apiFetch<ListingComment[]>(`/lost-items/${id}/comments`, { request })
}

/** The poster's own path, under their own ceiling; the desk writes on another. */
export async function replyToListingThread(
	id: string,
	body: string,
	request: Request,
): Promise<ListingComment> {
	return apiFetch<ListingComment>(`/lost-items/${id}/comments`, {
		method: 'POST',
		body: JSON.stringify({ body }),
		request,
	})
}

export async function markListingThreadRead(
	id: string,
	request: Request,
): Promise<void> {
	await apiFetch(`/lost-items/${id}/comments/read`, {
		method: 'PATCH',
		request,
	})
}

export async function listUnreadThreads(
	request: Request,
): Promise<UnreadThread[]> {
	return apiFetch<UnreadThread[]>('/lost-items/comments/unread', { request })
}
