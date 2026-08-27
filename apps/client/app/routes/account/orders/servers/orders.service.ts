import { apiFetch } from '@/shared/utils/api-fetch'
import type { StickerOrderListApiResponse } from '../types/orders.types'

export async function getMyStickerOrders(request: Request) {
	const response = await apiFetch<StickerOrderListApiResponse>(
		'/sticker-orders/mine?pageSize=50',
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
	return response.items
}
