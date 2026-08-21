import { STICKER_PACKS_BY_ID } from '@app/contracts/sticker-orders'
import type { StickerPack, StickerPackId } from '../types/sticker-order.types'

export function getStickerPack(packId: StickerPackId): StickerPack {
	return STICKER_PACKS_BY_ID[packId]
}
