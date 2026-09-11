import { z } from 'zod'
import { batchIdsSchema } from '../shared/batch'

/**
 * ⚠️ Moving an order forward, never cancelling one. Each transition tells the
 * buyer, and the shipping notice names the cash to have ready for the courier —
 * so a batch here promises deliveries, and a cancellation in a batch would
 * unpromise them just as fast. Cancelling stays one order at a time, behind its
 * confirmation.
 *
 * The target is explicit rather than « the next one for each »: a selection in
 * mixed states would otherwise send several different notices from one click,
 * and the operator would not know which.
 */
export const BATCH_STICKER_ORDER_STATUSES = [
	'processing',
	'shipped',
	'delivered',
] as const

export const batchUpdateStickerOrderStatusSchema = z.object({
	ids: batchIdsSchema,
	status: z.enum(BATCH_STICKER_ORDER_STATUSES, {
		error: 'Une annulation ne se fait pas en lot',
	}),
})

export type BatchUpdateStickerOrderStatusInput = z.input<
	typeof batchUpdateStickerOrderStatusSchema
>
export type BatchUpdateStickerOrderStatusData = z.output<
	typeof batchUpdateStickerOrderStatusSchema
>
