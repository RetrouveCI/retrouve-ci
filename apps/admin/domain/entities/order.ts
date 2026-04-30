export type OrderStatus =
	| 'pending'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'

export interface StickerOrder {
	id: string
	userId: number
	userName: string
	userEmail: string
	userPhone: string
	quantity: number
	status: OrderStatus
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes: string | null
	createdAt: string
	updatedAt: string
	shippedAt: string | null
	deliveredAt: string | null
	trackingNumber: string | null
}
