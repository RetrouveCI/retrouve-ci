import { z } from 'zod'

const labelSchema = z
	.string({ error: 'Donnez un nom à ce sticker' })
	.trim()
	.min(2, 'Donnez un nom à ce sticker')
	.max(80, 'Ce nom est trop long')

// Optional, so a form that does not carry the field is not a failed
// submission; the API is sent `undefined` rather than an empty string.
const linkedObjectSchema = z
	.string()
	.trim()
	.max(140, 'Cette description est trop longue')
	.optional()
	.default('')

export const activateStickerSchema = z.object({
	intent: z.literal('activate'),
	code: z
		.string({ error: 'Le code du sticker est requis' })
		.trim()
		.min(4, 'Le code du sticker est requis')
		.max(40, 'Ce code est trop long'),
	label: labelSchema,
	linkedObject: linkedObjectSchema,
})

export const updateStickerSchema = z.object({
	intent: z.literal('update'),
	code: z.string(),
	label: labelSchema,
	linkedObject: linkedObjectSchema,
})

export const revokeStickerSchema = z.object({
	intent: z.literal('revoke'),
	code: z.string(),
})

/** One rule per field, read by the forms and by the action alike. */
export const stickersActionSchema = z.discriminatedUnion('intent', [
	activateStickerSchema,
	updateStickerSchema,
	revokeStickerSchema,
])

export type ActivateStickerInput = z.input<typeof activateStickerSchema>
export type ActivateStickerData = z.output<typeof activateStickerSchema>

export type UpdateStickerInput = z.input<typeof updateStickerSchema>
export type UpdateStickerData = z.output<typeof updateStickerSchema>
