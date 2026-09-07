import { apiFetch } from '@/shared/utils/api-fetch'
import type { StickerOrderListApiResponse } from '../types/orders.types'

export async function getMyStickerOrdersPage(
	request: Request,
): Promise<StickerOrderListApiResponse> {
	return apiFetch<StickerOrderListApiResponse>(
		'/sticker-orders/mine?pageSize=50',
		{ request },
	)
}

export async function getMyStickerOrders(request: Request) {
	return (await getMyStickerOrdersPage(request)).items
}
