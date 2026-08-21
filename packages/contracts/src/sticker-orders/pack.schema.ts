import { z } from 'zod'
import { STICKER_PACK_IDS } from './sticker-orders.const'

export const stickerPackIdSchema = z.enum(STICKER_PACK_IDS, {
	error: 'Sélectionnez un pack',
})

export type StickerPackId = z.output<typeof stickerPackIdSchema>

export interface StickerPack {
	id: StickerPackId
	name: string
	quantity: number
	price: number
}

// Keyed by id, so resolving a pack the schema already accepted needs no runtime
// check and no non-null assertion.
export const STICKER_PACKS_BY_ID: Record<StickerPackId, StickerPack> = {
	'pack-4': { id: 'pack-4', name: 'Starter', quantity: 4, price: 1500 },
	'pack-8': { id: 'pack-8', name: 'Famille', quantity: 8, price: 2500 },
	'pack-20': { id: 'pack-20', name: 'Pro', quantity: 20, price: 7000 },
}

export const STICKER_PACKS = STICKER_PACK_IDS.map(id => STICKER_PACKS_BY_ID[id])
