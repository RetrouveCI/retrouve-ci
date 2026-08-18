export type OrderStatus =
	| 'pending'
	| 'processing'
	| 'shipped'
	| 'delivered'
	| 'cancelled'

export interface Order {
	id: string
	orderNumber: string
	date: string
	pack: { name: string; quantity: number; price: number }
	deliveryFee: number
	total: number
	status: OrderStatus
	paymentMethod: string
	deliveryAddress: string
	estimatedDelivery?: string
	trackingNumber?: string
}

export interface StickerOrderApiDto {
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
	createdAt: string
}

export interface StickerOrderListApiResponse {
	items: StickerOrderApiDto[]
	total: number
	page: number
	pageSize: number
}
