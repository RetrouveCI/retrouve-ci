import { z } from 'zod'
import { stickerOrderStatusSchema } from './status.schema'

export const updateStickerOrderStatusSchema = z.object({
	status: stickerOrderStatusSchema,
})

export type UpdateStickerOrderStatusInput = z.input<
	typeof updateStickerOrderStatusSchema
>
export type UpdateStickerOrderStatusData = z.output<
	typeof updateStickerOrderStatusSchema
>
