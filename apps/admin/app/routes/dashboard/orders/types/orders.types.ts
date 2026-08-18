export type OrderStatus =
	| 'pending'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'

export interface StickerOrder {
	id: string
	orderNumber: string
	packId: string
	packName: string
	quantity: number
	unitPrice: number
	deliveryFee: number
	total: number
	status: OrderStatus
	paymentMethod: string
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes: string | null
	trackingNumber: string | null
	userId: string
	createdAt: string
	updatedAt: string
	shippedAt: string | null
	deliveredAt: string | null
}

export interface StickerOrderListResponse {
	items: StickerOrder[]
	total: number
	page: number
	pageSize: number
}
