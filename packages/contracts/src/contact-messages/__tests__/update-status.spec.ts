import { describe, expect, it } from 'vitest'
import { updateContactMessageStatusSchema } from '../update-status.schema'

const parse = (status: unknown) =>
	updateContactMessageStatusSchema.safeParse({ status })

describe('updateContactMessageStatusSchema', () => {
	it.each(['read', 'archived'])('accepts %s', status => {
		expect(parse(status).success).toBe(true)
	})

	// `new` is set on creation; a caller must not be able to reset a message to it.
	it('refuses new, and any unknown status', () => {
		expect(parse('new').success).toBe(false)
		expect(parse('supprime').success).toBe(false)
	})

	it('answers in French', () => {
		expect(parse('new').error?.issues[0]?.message).toBe('Statut invalide')
	})
})
