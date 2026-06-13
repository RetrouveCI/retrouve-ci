export type StickerOrderStatus =
	| 'pending'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'

export interface StickerPack {
	id: string
	name: string
	quantity: number
	price: number
}

export interface CreateStickerOrderData {
	packId: string
	paymentMethod: string
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes?: string
	couponCode?: string
	userId: string
}

export interface ListStickerOrdersFilter {
	status?: StickerOrderStatus
	userId?: string
	page: number
	pageSize: number
}
