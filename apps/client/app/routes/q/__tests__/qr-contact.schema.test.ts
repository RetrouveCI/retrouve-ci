import { qrContactSchema } from '../qr-contact.schema'

const VALID = {
	name: 'Konan Yao',
	phone: '0700000000',
	email: '',
	message: "J'ai trouvé votre sac au marché de Cocody.",
}

function messageFor(overrides: Record<string, unknown>) {
	const result = qrContactSchema.safeParse({ ...VALID, ...overrides })
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('qrContactSchema', () => {
	it('accepts a complete message', () => {
		const result = qrContactSchema.safeParse(VALID)

		expect(result.success).toBe(true)
		expect(result.data?.name).toBe('Konan Yao')
	})

	// The form posts a blank for every untouched field, so these are the messages
	// an empty form actually shows — none of them may fall back to zod's English.
	it('answers in French for every blank the form can post', () => {
		expect(messageFor({ name: '' })).toBe('Veuillez entrer votre nom complet')
		expect(messageFor({ phone: '' })).toBe('Entrez un numéro à 10 chiffres')
		expect(messageFor({ message: '' })).toBe(
			'Votre message doit contenir au moins 5 caractères',
		)
	})

	it('caps the message at 500 characters', () => {
		expect(messageFor({ message: 'a'.repeat(501) })).toBe(
			'Votre message ne peut pas dépasser 500 caractères',
		)
		expect(
			qrContactSchema.safeParse({ ...VALID, message: 'a'.repeat(500) }).success,
		).toBe(true)
	})

	it('trims every field before validating', () => {
		const result = qrContactSchema.safeParse({
			name: '  Konan Yao  ',
			phone: '  0700000000  ',
			email: '  konan@exemple.ci  ',
			message: '  Bonjour, votre sac est chez moi.  ',
		})

		expect(result.data).toEqual({
			name: 'Konan Yao',
			phone: '0700000000',
			email: 'konan@exemple.ci',
			message: 'Bonjour, votre sac est chez moi.',
		})
	})

	// `email` is the only optional field, and the union that makes it optional is
	// where a wrong shape would silently answer in English.
	describe('the optional email', () => {
		it('accepts a blank, and a missing key', () => {
			expect(qrContactSchema.safeParse({ ...VALID, email: '' }).success).toBe(
				true,
			)

			const { email: _omitted, ...withoutEmail } = VALID
			expect(qrContactSchema.safeParse(withoutEmail).success).toBe(true)
		})

		it('rejects a malformed address, on the email field and in French', () => {
			const result = qrContactSchema.safeParse({
				...VALID,
				email: 'pasunemail',
			})

			expect(result.success).toBe(false)
			expect(result.error?.issues[0]?.path).toEqual(['email'])
			expect(result.error?.issues[0]?.message).toBe(
				'Veuillez entrer un email valide',
			)
		})
	})
})
