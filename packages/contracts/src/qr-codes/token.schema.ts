import { z } from 'zod'

/**
 * Activation and update post the same body, so they share one schema — the two
 * DTOs this replaces were identical to the character.
 */
export const qrTokenDetailsSchema = z.object({
	label: z.string().trim().max(60, 'Maximum 60 caractères').optional(),
	linkedObject: z.string().trim().max(120, 'Maximum 120 caractères').optional(),
})

export type QrTokenDetailsInput = z.input<typeof qrTokenDetailsSchema>
export type QrTokenDetailsData = z.output<typeof qrTokenDetailsSchema>
