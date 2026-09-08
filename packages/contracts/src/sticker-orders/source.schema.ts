import { z } from 'zod'
import { STICKER_ORDER_SOURCES } from './sticker-orders.const'

export const stickerOrderSourceSchema = z.enum(STICKER_ORDER_SOURCES, {
	error: 'Source invalide',
})

export type StickerOrderSource = z.output<typeof stickerOrderSourceSchema>
