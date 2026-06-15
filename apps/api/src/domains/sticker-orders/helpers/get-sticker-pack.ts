import { STICKER_PACKS } from '../constants'
import type { StickerPack } from '../types/sticker-order.types'

export function getStickerPack(packId: string): StickerPack | undefined {
	return STICKER_PACKS.find(pack => pack.id === packId)
}
