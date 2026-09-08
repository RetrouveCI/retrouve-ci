import type { StickerOrderStatus } from '@app/contracts/sticker-orders'

export const ORDER_NUMBER_PREFIX = 'CMD'

// Open until the order is in the customer's hands or called off. A partition of
// the contract's statuses, asserted as one: a new status forces a decision.
export const OPEN_STICKER_ORDER_STATUSES: readonly StickerOrderStatus[] = [
	'pending',
	'processing',
	'shipped',
]

export const SETTLED_STICKER_ORDER_STATUSES: readonly StickerOrderStatus[] = [
	'delivered',
	'cancelled',
]

// Stickers are paid to the courier, so an open order is unpaid exposure: what
// an account holds at once is the bound, where a rate ceiling bounds a burst.
export const MAX_OPEN_STICKER_ORDERS = 2
