import type {
	CreateStickerOrderData as CreateStickerOrderContract,
	ListStickerOrdersFilterData,
	StickerOrderSource,
	StickerOrderStatus,
	StickerPack,
	StickerPackId,
} from '@app/contracts/sticker-orders'
import type { Paginated } from '@/shared/utils/pagination.util'

export type {
	StickerOrderSource,
	StickerOrderStatus,
	StickerPack,
	StickerPackId,
}

/** `userId` comes from the session, never from the body. */
export type CreateStickerOrderData = CreateStickerOrderContract & {
	userId: string
}

/** The admin list is unscoped; `listMine` narrows it to the session's user. */
export type ListStickerOrdersFilter = ListStickerOrdersFilterData & {
	userId?: string
}

/** What the repository writes: the use-case has already priced the order. */
export interface CreateStickerOrderRecord {
	orderNumber: string
	packId: string
	packName: string
	quantity: number
	unitPrice: number
	deliveryFee: number
	total: number
	paymentMethod: string
	source: StickerOrderSource
	deliveryAddress: string
	deliveryCity: string
	deliveryNotes?: string
	userId: string
}

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
	source: StickerOrderSource
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

export type StickerOrderListResponse = Paginated<StickerOrder>
