import { getStickerPack } from '../helpers/get-sticker-pack'
import { InvalidStickerOrderError } from '../errors/sticker-order.errors'
import type { CreateStickerOrderData } from '../types/sticker-order.types'

export function validateCreateStickerOrder(data: CreateStickerOrderData): void {
	if (!getStickerPack(data.packId)) {
		throw new InvalidStickerOrderError(
			`Le pack de stickers "${data.packId}" n'existe pas`,
		)
	}
}
