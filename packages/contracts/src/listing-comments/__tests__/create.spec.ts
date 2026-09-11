import { describe, expect, it } from 'vitest'
import { createListingCommentSchema } from '../create.schema'

const messageFor = (input: unknown) => {
	const result = createListingCommentSchema.safeParse(input)
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('createListingCommentSchema', () => {
	it('accepts a suggestion and trims it', () => {
		expect(
			createListingCommentSchema.parse({
				body: '  Ajoutez une photo du dos  ',
			}),
		).toEqual({ body: 'Ajoutez une photo du dos' })
	})

	it('answers in French for an absent body', () => {
		expect(messageFor({})).toBe('Le message est requis')
	})

	it('refuses a body that is only whitespace', () => {
		expect(messageFor({ body: '   ' })).toBe('Le message ne peut pas être vide')
	})

	// A literal, not the constant: moving the constant must not move both sides.
	it('caps the body at 1000 characters', () => {
		expect(
			createListingCommentSchema.safeParse({ body: 'a'.repeat(1000) }).success,
		).toBe(true)
		expect(messageFor({ body: 'a'.repeat(1001) })).toBe(
			'Maximum 1000 caractères',
		)
	})
})
