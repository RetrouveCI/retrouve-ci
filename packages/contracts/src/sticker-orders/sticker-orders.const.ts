export const STICKER_ORDER_STATUSES = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
] as const

export const STICKER_PACK_IDS = ['pack-4', 'pack-8', 'pack-20'] as const

export const DELIVERY_FEE = 1000

export const FREE_DELIVERY_COUPONS: readonly string[] = [
	'RETROUVECI',
	'LIVRAISON0',
	'WELCOME2025',
]
