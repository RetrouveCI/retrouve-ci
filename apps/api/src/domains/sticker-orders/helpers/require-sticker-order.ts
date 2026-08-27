import { StickerOrderNotFoundError } from '../errors/sticker-order.errors'
import type { StickerOrderRepository } from '../repository/sticker-order.repository'
import type { StickerOrder } from '../types/sticker-order.types'

export async function requireStickerOrder(
	repository: StickerOrderRepository,
	id: string,
): Promise<StickerOrder> {
	const stickerOrder = await repository.findById(id)

	if (!stickerOrder) {
		throw new StickerOrderNotFoundError(id)
	}

	return stickerOrder
}
