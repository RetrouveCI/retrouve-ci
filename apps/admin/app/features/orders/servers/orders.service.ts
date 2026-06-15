import { apiFetch } from '@/shared/lib/api-client'
import type {
	OrderStatus,
	StickerOrder,
	StickerOrderListResponse,
} from '../orders.types'

export async function listOrders(
	params: { status?: OrderStatus; page?: number; pageSize?: number },
	request: Request,
): Promise<StickerOrderListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 50),
	})
	if (params.status) query.set('status', params.status)

	return apiFetch<StickerOrderListResponse>(
		`/sticker-orders?${query.toString()}`,
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
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
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
