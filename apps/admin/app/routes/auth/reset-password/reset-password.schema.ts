import { z } from 'zod'

export const resetPasswordSchema = z
	.object({
		token: z.string().min(1),
		newPassword: z
			.string()
			.min(8, 'Au moins 8 caractères')
			.regex(/[A-Z]/, 'Au moins une majuscule')
			.regex(/[a-z]/, 'Au moins une minuscule')
			.regex(/[0-9]/, 'Au moins un chiffre'),
		confirmPassword: z.string(),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})
