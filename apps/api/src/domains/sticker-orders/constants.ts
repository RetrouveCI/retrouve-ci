import type {
	StickerOrderStatus,
	StickerPack,
} from './types/sticker-order.types'

export const STICKER_ORDER_STATUSES: StickerOrderStatus[] = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
]

export const STICKER_PACKS: StickerPack[] = [
	{ id: 'pack-4', name: 'Starter', quantity: 4, price: 1500 },
	{ id: 'pack-8', name: 'Famille', quantity: 8, price: 2500 },
	{ id: 'pack-20', name: 'Pro', quantity: 20, price: 7000 },
]

export const STICKER_PACK_IDS = STICKER_PACKS.map(pack => pack.id)

export const DELIVERY_FEE = 1000
export const FREE_DELIVERY_COUPONS = ['RETROUVECI', 'LIVRAISON0', 'WELCOME2025']

export const ORDER_NUMBER_PREFIX = 'CMD'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 50
