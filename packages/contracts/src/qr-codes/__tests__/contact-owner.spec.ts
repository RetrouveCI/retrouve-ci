import { describe, expect, it } from 'vitest'
import { contactOwnerSchema } from '../contact-owner.schema'

const VALID = {
	name: 'Konan Yao',
	phone: '0700000000',
	email: 'konan@exemple.ci',
	message: "J'ai trouvé votre sac près du Plateau.",
}

const messageFor = (overrides: Record<string, unknown>) => {
	const result = contactOwnerSchema.safeParse({ ...VALID, ...overrides })
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('contactOwnerSchema', () => {
	it('accepts a complete message and trims every field', () => {
		expect(
			contactOwnerSchema.safeParse({
				name: '  Konan Yao  ',
				phone: '  0700000000  ',
				email: '  konan@exemple.ci  ',
				message: `  ${VALID.message}  `,
			}).data,
		).toEqual(VALID)
	})

	it('treats the email as optional, blank included', () => {
		const { email, ...withoutEmail } = VALID

		expect(contactOwnerSchema.safeParse(withoutEmail).success).toBe(true)
		expect(contactOwnerSchema.safeParse({ ...VALID, email: '' }).success).toBe(
			true,
		)
	})

	// The API accepted any non-empty string and the form asked for eight
	// characters; the owner has to call this number back.
	it.each(['0700000000', '07 00 00 00 00', '+2250700000000', '2250700000000'])(
		'accepts the phone %s',
		phone => {
			expect(contactOwnerSchema.safeParse({ ...VALID, phone }).success).toBe(
				true,
			)
		},
	)

	it.each(['', '070000000', '070000000012', '12345678', 'appelez-moi'])(
		'refuses the phone %s, in French',
		phone => {
			expect(messageFor({ phone })).toBe('Entrez un numéro à 10 chiffres')
		},
	)

	it('answers in French for every blank a form can post', () => {
		expect(messageFor({ name: '' })).toBe('Veuillez entrer votre nom complet')
		expect(messageFor({ message: '' })).toBe(
			'Votre message doit contenir au moins 5 caractères',
		)
		expect(messageFor({ email: 'pasunemail' })).toBe(
			'Veuillez entrer un email valide',
		)
	})

	it.each([
		['name', 100, 'Maximum 100 caractères'],
		['message', 500, 'Votre message ne peut pas dépasser 500 caractères'],
	])('caps %s at %i characters', (field, max, expected) => {
		expect(messageFor({ [field]: 'a'.repeat(max + 1) })).toBe(expected)
		expect(
			contactOwnerSchema.safeParse({ ...VALID, [field]: 'a'.repeat(max) })
				.success,
		).toBe(true)
	})
})
