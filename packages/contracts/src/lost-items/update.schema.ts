import { z } from 'zod'
import { lostItemFieldsSchema } from './create.schema'
import { pushLostItemWriteIssues } from './documents.schema'
import { resolutionStatusSchema } from './enums.schema'

// `type` and `category` are set once, at publication: an annonce that turned
// from lost to found is a different annonce.
export const updateLostItemSchema = lostItemFieldsSchema
	.omit({ type: true, category: true })
	.partial()
	.extend({ resolutionStatus: resolutionStatusSchema.optional() })
	// The holder's name is not demanded again: the row already carries the one
	// the patch does not repeat. The description floor still holds — dropping it
	// with the shape's `min` would have let an edit shorten what a creation
	// refuses.
	.check(ctx => pushLostItemWriteIssues(ctx, { requireHolderName: false }))

export type UpdateLostItemInput = z.input<typeof updateLostItemSchema>
export type UpdateLostItemData = z.output<typeof updateLostItemSchema>
