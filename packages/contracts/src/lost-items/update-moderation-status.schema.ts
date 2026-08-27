import { z } from 'zod'
import { moderationStatusSchema } from './enums.schema'

export const updateModerationStatusSchema = z.object({
	moderationStatus: moderationStatusSchema,
})

export type UpdateModerationStatusInput = z.input<
	typeof updateModerationStatusSchema
>
export type UpdateModerationStatusData = z.output<
	typeof updateModerationStatusSchema
>
