import type { StickerOrderStatus } from '../types/sticker-order.types'

export interface StickerOrder {
	id: string
	orderNumber: string
	packId: string
	packName: string
	quantity: number
	unitPrice: number
	deliveryFee: number
	total: number
	status: StickerOrderStatus
	paymentMethod: string
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes: string | null
	trackingNumber: string | null
	userId: string
	createdAt: Date
	updatedAt: Date
	shippedAt: Date | null
	deliveredAt: Date | null
}

export interface StickerOrderListResponse {
	items: StickerOrder[]
	total: number
	page: number
	pageSize: number
}
