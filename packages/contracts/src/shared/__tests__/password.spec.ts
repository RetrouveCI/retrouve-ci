import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	PASSWORD_MISMATCH_MESSAGE,
	currentPasswordSchema,
	passwordSchema,
	withPasswordConfirmation,
} from '../password'

const VALID = 'Abcdefg1'

function messagesFor(input: string): string[] {
	return passwordSchema.safeParse(input).error?.issues.map(i => i.message) ?? []
}

describe('passwordSchema', () => {
	it('accepts a password meeting every rule', () => {
		expect(passwordSchema.safeParse(VALID).success).toBe(true)
	})

	it('accepts the exact lower bound', () => {
		expect(passwordSchema.safeParse('Abcdefg1').success).toBe(true)
		expect(VALID).toHaveLength(PASSWORD_MIN_LENGTH)
	})

	it('accepts the exact upper bound', () => {
		const atCeiling = `Aa1${'x'.repeat(PASSWORD_MAX_LENGTH - 3)}`

		expect(atCeiling).toHaveLength(PASSWORD_MAX_LENGTH)
		expect(passwordSchema.safeParse(atCeiling).success).toBe(true)
	})

	it('refuses one character past the upper bound', () => {
		const overCeiling = `Aa1${'x'.repeat(PASSWORD_MAX_LENGTH - 2)}`

		expect(overCeiling).toHaveLength(PASSWORD_MAX_LENGTH + 1)
		expect(messagesFor(overCeiling)).toContain(
			`Au plus ${PASSWORD_MAX_LENGTH} caractères`,
		)
	})

	// The rule the six forms disagreed on: seven characters used to pass on
	// three of them.
	it('refuses one character short of the lower bound', () => {
		expect(messagesFor('Abcdef1')).toContain(
			`Au moins ${PASSWORD_MIN_LENGTH} caractères`,
		)
	})

	it.each([
		['abcdefg1', 'Au moins une majuscule'],
		['ABCDEFG1', 'Au moins une minuscule'],
		['Abcdefgh', 'Au moins un chiffre'],
	])('refuses %s for want of %s', (input, message) => {
		expect(messagesFor(input)).toContain(message)
	})

	it('reports every French message it breaks at once', () => {
		expect(messagesFor('short')).toEqual([
			`Au moins ${PASSWORD_MIN_LENGTH} caractères`,
			'Au moins une majuscule',
			'Au moins un chiffre',
		])
	})

	it('refuses an empty password', () => {
		expect(passwordSchema.safeParse('').success).toBe(false)
	})
})

describe('currentPasswordSchema', () => {
	// A login field checks presence only — the account may predate the rule.
	it('accepts a password the write rule would refuse', () => {
		expect(currentPasswordSchema.safeParse('abcdef').success).toBe(true)
	})

	it('refuses a blank field', () => {
		expect(currentPasswordSchema.safeParse('').error?.issues[0]?.message).toBe(
			'Mot de passe requis',
		)
	})
})

describe('withPasswordConfirmation', () => {
	const schema = withPasswordConfirmation(
		z.object({
			newPassword: passwordSchema,
			confirmPassword: z.string(),
		}),
	)

	it('accepts a matching pair', () => {
		expect(
			schema.safeParse({ newPassword: VALID, confirmPassword: VALID }).success,
		).toBe(true)
	})

	it('reports a mismatch on confirmPassword, not on newPassword', () => {
		const issues =
			schema.safeParse({ newPassword: VALID, confirmPassword: 'Abcdefg2' })
				.error?.issues ?? []

		expect(issues).toHaveLength(1)
		expect(issues[0]?.path).toEqual(['confirmPassword'])
		expect(issues[0]?.message).toBe(PASSWORD_MISMATCH_MESSAGE)
	})

	it('leaves the wrapped shape intact', () => {
		const parsed = schema.safeParse({
			newPassword: VALID,
			confirmPassword: VALID,
		})

		expect(parsed.data).toEqual({
			newPassword: VALID,
			confirmPassword: VALID,
		})
	})
})

describe('a password field that never arrived', () => {
	it.each([undefined, null, 42])('answers %j in French', input => {
		expect(passwordSchema.safeParse(input).error?.issues[0]?.message).toBe(
			'Le mot de passe est requis',
		)
	})

	it('answers in French for the login field too', () => {
		expect(
			currentPasswordSchema.safeParse(undefined).error?.issues[0]?.message,
		).toBe('Mot de passe requis')
	})
})
