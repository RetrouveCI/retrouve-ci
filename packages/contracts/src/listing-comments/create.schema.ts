import { z } from 'zod'
import { LISTING_COMMENT_MAX_LENGTH } from './listing-comments.const'

// Named on the type error too: an absent `body` fails before `.min()` does.
export const createListingCommentSchema = z.object({
	body: z
		.string({ error: 'Le message est requis' })
		.trim()
		.min(1, 'Le message ne peut pas être vide')
		.max(
			LISTING_COMMENT_MAX_LENGTH,
			`Maximum ${LISTING_COMMENT_MAX_LENGTH} caractères`,
		),
})

export type CreateListingCommentInput = z.input<
	typeof createListingCommentSchema
>
export type CreateListingCommentData = z.output<
	typeof createListingCommentSchema
>
