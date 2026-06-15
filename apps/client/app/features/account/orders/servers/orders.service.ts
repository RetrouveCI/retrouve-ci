import { apiFetch } from '@/shared/lib/api-client'
import type { StickerOrderListApiResponse } from '../orders.types'

export async function getMyStickerOrders(request: Request) {
	const response = await apiFetch<StickerOrderListApiResponse>(
		'/sticker-orders/mine?pageSize=50',
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
	return response.items
}
