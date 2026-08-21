import { describe, expect, it } from 'vitest'
import { createContactMessageSchema } from '../create.schema'

const VALID = {
	name: 'Konan Yao',
	email: 'konan@exemple.ci',
	subject: 'Question sur une annonce',
	message: "J'aimerais des précisions sur l'annonce publiée hier.",
}

const messageFor = (overrides: Record<string, unknown>) => {
	const result = createContactMessageSchema.safeParse({
		...VALID,
		...overrides,
	})
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('createContactMessageSchema', () => {
	it('accepts a complete message and trims every field', () => {
		const result = createContactMessageSchema.safeParse({
			name: '  Konan Yao  ',
			email: '  konan@exemple.ci  ',
			subject: '  Question  ',
			message: `  ${VALID.message}  `,
		})

		expect(result.data).toEqual({
			name: 'Konan Yao',
			email: 'konan@exemple.ci',
			subject: 'Question',
			message: VALID.message,
		})
	})

	it('answers in French for every blank a form can post', () => {
		expect(messageFor({ name: '' })).toBe('Veuillez entrer votre nom complet')
		expect(messageFor({ email: '' })).toBe('Veuillez entrer un email valide')
		expect(messageFor({ subject: '' })).toBe('Veuillez entrer un sujet')
		expect(messageFor({ message: '' })).toBe(
			'Votre message doit contenir au moins 10 caractères',
		)
	})

	// The ceilings the API enforced and the client form did not.
	it.each([
		['name', 100, 'Maximum 100 caractères'],
		['subject', 150, 'Maximum 150 caractères'],
		['message', 2000, 'Maximum 2000 caractères'],
	])('caps %s at %i characters', (field, max, expected) => {
		expect(messageFor({ [field]: 'a'.repeat(max + 1) })).toBe(expected)
		expect(
			createContactMessageSchema.safeParse({
				...VALID,
				[field]: 'a'.repeat(max),
			}).success,
		).toBe(true)
	})

	it('rejects a malformed email', () => {
		expect(messageFor({ email: 'pasunemail' })).toBe(
			'Veuillez entrer un email valide',
		)
	})
})
