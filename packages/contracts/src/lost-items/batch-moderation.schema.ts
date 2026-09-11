import { z } from 'zod'
import { batchIdsSchema } from '../shared/batch'

/**
 * ⚠️ Publication only, and the literal is the reason. Hiding is shown to the
 * poster and asks for a motive, which is a judgement on one listing rather than
 * on a selection; putting it in a batch would apply one operator's sentence to
 * twenty people's listings. Widening this literal to an enum is what would add
 * a second batch decision, deliberately.
 */
export const batchModerateLostItemsSchema = z.object({
	ids: batchIdsSchema,
	moderationStatus: z.literal('published', {
		error: 'Seule la publication se fait en lot',
	}),
})

export type BatchModerateLostItemsInput = z.input<
	typeof batchModerateLostItemsSchema
>
export type BatchModerateLostItemsData = z.output<
	typeof batchModerateLostItemsSchema
>
