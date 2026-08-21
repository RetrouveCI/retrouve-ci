import type {
	CreateStickerOrderData as CreateStickerOrderContract,
	ListStickerOrdersFilterData,
	StickerOrderStatus,
	StickerPack,
	StickerPackId,
} from '@app/contracts/sticker-orders'

export type { StickerOrderStatus, StickerPack, StickerPackId }

/** `userId` comes from the session, never from the body. */
export type CreateStickerOrderData = CreateStickerOrderContract & {
	userId: string
}

/** The admin list is unscoped; `listMine` narrows it to the session's user. */
export type ListStickerOrdersFilter = ListStickerOrdersFilterData & {
	userId?: string
}
