import type { BatchUpdateStickerOrderStatusData } from '@app/contracts/sticker-orders'
import type { BatchOutcome } from '@app/contracts/shared'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	OrderStatus,
	StickerOrder,
	StickerOrderListResponse,
} from '../types/orders.types'

export async function listOrders(
	params: {
		status?: OrderStatus
		search?: string
		page?: number
		pageSize?: number
	},
	request: Request,
): Promise<StickerOrderListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 50),
	})
	if (params.status) query.set('status', params.status)
	if (params.search) query.set('search', params.search)

	return apiFetch<StickerOrderListResponse>(
		`/sticker-orders?${query.toString()}`,
		{ request },
	)
}

/** Through the desk's own route: `/sticker-orders/:id` answers the buyer alone. */
export async function getOrder(
	id: string,
	request: Request,
): Promise<StickerOrder> {
	return apiFetch<StickerOrder>(
		`/sticker-orders/admin/${encodeURIComponent(id)}`,
		{ request },
	)
}

export async function updateOrderStatus(
	id: string,
	status: OrderStatus,
	request: Request,
): Promise<StickerOrder> {
	return apiFetch<StickerOrder>(`/sticker-orders/${id}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ status }),
		request,
	})
}

/** Moving a selection forward. The API runs them one at a time and says which. */
export async function updateOrderStatusBatch(
	body: BatchUpdateStickerOrderStatusData,
	request: Request,
): Promise<BatchOutcome> {
	return apiFetch<BatchOutcome>('/sticker-orders/status/batch', {
		method: 'PATCH',
		body: JSON.stringify(body),
		request,
	})
}
