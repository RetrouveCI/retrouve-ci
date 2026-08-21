import type { CreateStickerOrderInput } from '@app/contracts/sticker-orders'
import { apiFetch } from '@/shared/utils/api-fetch'
import type { StickerOrderApiDto } from '../../../account/orders/types/orders.types'

export async function createStickerOrder(
	payload: CreateStickerOrderInput,
	request: Request,
): Promise<StickerOrderApiDto> {
	return apiFetch<StickerOrderApiDto>('/sticker-orders', {
		method: 'POST',
		body: JSON.stringify(payload),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
