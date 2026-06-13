import type {
	StickerOrder,
	StickerOrderListResponse,
} from '../models/sticker-order.model'
import type {
	ListStickerOrdersFilter,
	StickerOrderStatus,
} from '../types/sticker-order.types'

export const STICKER_ORDER_REPOSITORY = Symbol('STICKER_ORDER_REPOSITORY')

export interface CreateStickerOrderRecord {
	orderNumber: string
	packId: string
	packName: string
	quantity: number
	unitPrice: number
	deliveryFee: number
	total: number
	paymentMethod: string
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes?: string
	userId: string
}

export interface StickerOrderRepository {
	create(data: CreateStickerOrderRecord): Promise<StickerOrder>
	findById(id: string): Promise<StickerOrder | null>
	list(filter: ListStickerOrdersFilter): Promise<StickerOrderListResponse>
	updateStatus(id: string, status: StickerOrderStatus): Promise<StickerOrder>
}
