import { z } from 'zod'
import { moderationReasonSchema, moderationStatusSchema } from './enums.schema'
import { MAX_MODERATION_NOTE_LENGTH } from './lost-items.const'

export const updateModerationStatusSchema = z
	.object({
		moderationStatus: moderationStatusSchema,
		/** Optional throughout: hiding without saying why stays possible. */
		moderationReason: moderationReasonSchema.optional(),
		moderationReasonNote: z
			.string()
			.trim()
			.max(
				MAX_MODERATION_NOTE_LENGTH,
				`Maximum ${MAX_MODERATION_NOTE_LENGTH} caractères`,
			)
			.optional(),
	})
	.check(ctx => {
		const { moderationStatus, moderationReason, moderationReasonNote } =
			ctx.value

		const push = (
			path: 'moderationReason' | 'moderationReasonNote',
			message: string,
		) =>
			ctx.issues.push({
				code: 'custom',
				message,
				input: ctx.value,
				path: [path],
			})

		// A reason explains a removal; on the way back to published or pending it
		// would be stored against a listing nobody is being told anything about.
		if (moderationStatus !== 'hidden' && moderationReason !== undefined) {
			push('moderationReason', "Un motif ne s'attache qu'à un masquage")
		}

		// `other` is the escape hatch, so it has to say what it means.
		if (
			moderationReason === 'other' &&
			(moderationReasonNote ?? '').length === 0
		) {
			push('moderationReasonNote', 'Précisez le motif')
		}

		if (moderationReason !== 'other' && (moderationReasonNote ?? '').length) {
			push(
				'moderationReasonNote',
				'La précision est réservée au motif « Autre »',
			)
		}
	})

export type UpdateModerationStatusInput = z.input<
	typeof updateModerationStatusSchema
>
export type UpdateModerationStatusData = z.output<
	typeof updateModerationStatusSchema
>
