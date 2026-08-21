import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_HINT = `Min. ${PASSWORD_MIN_LENGTH} caractères, 1 majuscule, 1 minuscule, 1 chiffre`
export const PASSWORD_PLACEHOLDER = `Minimum ${PASSWORD_MIN_LENGTH} caractères`
export const PASSWORD_MISMATCH_MESSAGE =
	'Les mots de passe ne correspondent pas'

export const passwordSchema = z
	.string({ error: 'Le mot de passe est requis' })
	.min(PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères`)
	.max(PASSWORD_MAX_LENGTH, `Au plus ${PASSWORD_MAX_LENGTH} caractères`)
	.regex(/[A-Z]/, 'Au moins une majuscule')
	.regex(/[a-z]/, 'Au moins une minuscule')
	.regex(/[0-9]/, 'Au moins un chiffre')

/**
 * A login field only checks presence: the rule above governs what may be
 * written, and telling someone their existing password is malformed helps
 * nobody.
 */
export const currentPasswordSchema = z
	.string({ error: 'Mot de passe requis' })
	.min(1, 'Mot de passe requis')

interface PasswordConfirmation {
	newPassword: string
	confirmPassword: string
}

export function withPasswordConfirmation<
	TOutput extends PasswordConfirmation,
	TInput,
>(schema: z.ZodType<TOutput, TInput>) {
	return schema.refine(data => data.newPassword === data.confirmPassword, {
		error: PASSWORD_MISMATCH_MESSAGE,
		path: ['confirmPassword'],
	})
}
