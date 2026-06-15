import { apiFetch } from '@/shared/lib/api-client'
import type { StickerOrderApiDto } from '../../../account/orders/orders.types'

export interface CreateStickerOrderPayload {
	packId: string
	paymentMethod: string
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes?: string
	couponCode?: string
}

export async function createStickerOrder(
	payload: CreateStickerOrderPayload,
	request: Request,
): Promise<StickerOrderApiDto> {
	return apiFetch<StickerOrderApiDto>('/sticker-orders', {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
