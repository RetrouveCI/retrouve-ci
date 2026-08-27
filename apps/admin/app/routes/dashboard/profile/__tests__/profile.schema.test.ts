import { changePasswordSchema } from '../profile.schema'

const valid = {
	currentPassword: 'ancien-mot-de-passe',
	newPassword: 'Nouveau123',
	confirmPassword: 'Nouveau123',
}

function messagesFor(input: Record<string, string>) {
	const result = changePasswordSchema.safeParse(input)
	return (result.error?.issues ?? []).map(issue => issue.message)
}

describe('changePasswordSchema', () => {
	it('accepts a password holding a lowercase, an uppercase and a digit', () => {
		expect(changePasswordSchema.safeParse(valid).success).toBe(true)
	})

	it('requires the current password', () => {
		expect(messagesFor({ ...valid, currentPassword: '' })).toContain(
			'Mot de passe actuel requis',
		)
	})

	it('reports each rule the new password breaks', () => {
		expect(
			messagesFor({
				...valid,
				newPassword: 'court',
				confirmPassword: 'court',
			}),
		).toEqual([
			'Au moins 8 caractères',
			'Au moins une majuscule',
			'Au moins un chiffre',
		])
	})

	it('requires a confirmation', () => {
		expect(messagesFor({ ...valid, confirmPassword: '' })).toContain(
			'Confirmation requise',
		)
	})

	it('reports a mismatch on the confirmation field', () => {
		const result = changePasswordSchema.safeParse({
			...valid,
			confirmPassword: 'Different123',
		})

		expect(result.error?.issues[0]?.path).toEqual(['confirmPassword'])
		expect(result.error?.issues[0]?.message).toBe(
			'Les mots de passe ne correspondent pas',
		)
	})
})
