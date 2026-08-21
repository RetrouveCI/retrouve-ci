import { z } from 'zod'
import { STICKER_ORDER_STATUSES } from './sticker-orders.const'

export const stickerOrderStatusSchema = z.enum(STICKER_ORDER_STATUSES, {
	error: 'Statut invalide',
})

export type StickerOrderStatus = z.output<typeof stickerOrderStatusSchema>
