import { z } from 'zod'
import {
	QR_LABEL_MAX_LENGTH,
	QR_LINKED_OBJECT_MAX_LENGTH,
} from './qr-codes.const'

/**
 * Activation and update post the same body, so they share one schema — the two
 * DTOs this replaces were identical to the character.
 */
export const qrTokenDetailsSchema = z.object({
	label: z
		.string()
		.trim()
		.max(QR_LABEL_MAX_LENGTH, `Maximum ${QR_LABEL_MAX_LENGTH} caractères`)
		.optional(),
	linkedObject: z
		.string()
		.trim()
		.max(
			QR_LINKED_OBJECT_MAX_LENGTH,
			`Maximum ${QR_LINKED_OBJECT_MAX_LENGTH} caractères`,
		)
		.optional(),
})

export type QrTokenDetailsInput = z.input<typeof qrTokenDetailsSchema>
export type QrTokenDetailsData = z.output<typeof qrTokenDetailsSchema>
