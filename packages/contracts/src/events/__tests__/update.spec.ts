import { describe, expect, it } from 'vitest'
import { updateEventSchema } from '../update.schema'

const parse = (input: unknown) => updateEventSchema.safeParse(input)

describe('updateEventSchema', () => {
	// `validateUpdateEvent` let an empty update through; every field is optional.
	it('accepts an empty update', () => {
		expect(parse({}).data).toEqual({})
	})

	it('accepts a partial update and trims it', () => {
		expect(parse({ title: '  Nouvelle braderie  ' }).data).toEqual({
			title: 'Nouvelle braderie',
		})
	})

	it('accepts a status on its own', () => {
		expect(parse({ status: 'published' }).data).toEqual({ status: 'published' })
	})

	// The other half of what `validateUpdateEvent` enforced.
	it('still measures a supplied description after trimming', () => {
		const result = parse({ description: '  Court  ' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe(
			'La description doit contenir au moins 10 caractères',
		)
	})

	it('refuses an unknown status, in French', () => {
		const result = parse({ status: 'supprime' })

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Statut invalide')
	})

	it('refuses an invalid date, in French', () => {
		expect(parse({ eventDate: 'demain' }).error?.issues[0]?.message).toBe(
			'Date invalide',
		)
	})
})
