import { z } from 'zod'
import { createLostItemSchema } from './create.schema'
import { resolutionStatusSchema } from './enums.schema'

// `type` and `category` are set once, at publication: an annonce that turned
// from lost to found is a different annonce.
export const updateLostItemSchema = createLostItemSchema
	.omit({ type: true, category: true })
	.partial()
	.extend({ resolutionStatus: resolutionStatusSchema.optional() })

export type UpdateLostItemInput = z.input<typeof updateLostItemSchema>
export type UpdateLostItemData = z.output<typeof updateLostItemSchema>
