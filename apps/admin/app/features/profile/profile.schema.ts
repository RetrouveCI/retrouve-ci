import { z } from 'zod'

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
		newPassword: z
			.string()
			.min(8, 'Au moins 8 caractères')
			.regex(/[A-Z]/, 'Au moins une majuscule')
			.regex(/[a-z]/, 'Au moins une minuscule')
			.regex(/[0-9]/, 'Au moins un chiffre'),
		confirmPassword: z.string().min(1, 'Confirmation requise'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})
