export const STICKER_ORDER_STATUSES = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
] as const

export const STICKER_PACK_IDS = ['pack-4', 'pack-8', 'pack-20'] as const

export const DELIVERY_FEE = 1000

/**
 * Stickers are paid to the courier, so an order carries no payment choice: the
 * use-case stamps this on every row rather than reading it from the body. It
 * stays a column, and a named constant, so wiring a mobile-money gateway later
 * is a new value here and not a migration.
 */
export const PAYMENT_ON_DELIVERY = 'cash-on-delivery'
export const PAYMENT_ON_DELIVERY_LABEL = 'Paiement à la livraison'

export const FREE_DELIVERY_COUPONS: readonly string[] = [
	'RETROUVECI',
	'LIVRAISON0',
	'WELCOME2025',
]
