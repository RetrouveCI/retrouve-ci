import { describe, expect, it } from 'vitest'
import { PASSWORD_MIN_LENGTH } from '../../shared/password'
import { setInitialPasswordSchema } from '../set-initial-password.schema'

describe('setInitialPasswordSchema', () => {
	it('accepts a password meeting the shared rule', () => {
		expect(
			setInitialPasswordSchema.safeParse({ newPassword: 'Abcdefg1' }).success,
		).toBe(true)
	})

	// The DTO this replaces allowed six characters and no complexity at all.
	it.each(['abcdef', 'Abcdef1', 'abcdefg1', 'ABCDEFG1', 'Abcdefgh'])(
		'refuses %s',
		newPassword => {
			expect(setInitialPasswordSchema.safeParse({ newPassword }).success).toBe(
				false,
			)
		},
	)

	it('names the field the API answers with', () => {
		const result = setInitialPasswordSchema.safeParse({ newPassword: 'short' })

		expect(result.error?.issues[0]?.path).toEqual(['newPassword'])
		expect(result.error?.issues[0]?.message).toBe(
			`Au moins ${PASSWORD_MIN_LENGTH} caractères`,
		)
	})

	// Zod answers a missing or mistyped field in English unless the schema names
	// its own message, and every message the API returns must be French.
	it.each([{}, { newPassword: null }, { newPassword: 42 }])(
		'refuses %j in French',
		input => {
			const result = setInitialPasswordSchema.safeParse(input)

			expect(result.success).toBe(false)
			expect(result.error?.issues[0]?.message).toBe(
				'Le mot de passe est requis',
			)
		},
	)

	// The pipe strips what the schema does not know, where the DTO answered 400.
	it('strips an unknown field', () => {
		expect(
			setInitialPasswordSchema.safeParse({
				newPassword: 'Abcdefg1',
				role: 'admin',
			}).data,
		).toEqual({ newPassword: 'Abcdefg1' })
	})
})
