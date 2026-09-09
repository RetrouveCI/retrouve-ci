import { z } from 'zod'
import { stickerPackIdSchema } from './pack.schema'
import { stickerOrderSourceSchema } from './source.schema'

export const createStickerOrderSchema = z.object({
	packId: stickerPackIdSchema,
	deliveryAddress: z
		.string()
		.trim()
		.min(5, 'Adresse trop courte')
		.max(200, 'Maximum 200 caractères'),
	deliveryCity: z
		.string()
		.trim()
		.min(2, 'La ville est requise')
		.max(120, 'Maximum 120 caractères'),
	deliveryNotes: z
		.string()
		.trim()
		.max(500, 'Maximum 500 caractères')
		.optional(),
	couponCode: z.string().trim().max(30, 'Maximum 30 caractères').optional(),
	// Optional: a direct arrival carries none, and the use-case stamps the
	// default rather than trusting the body to name it.
	source: stickerOrderSourceSchema.optional(),
})

export type CreateStickerOrderInput = z.input<typeof createStickerOrderSchema>
export type CreateStickerOrderData = z.output<typeof createStickerOrderSchema>
