import { z } from 'zod'

export const phoneNumberSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.min(8, 'Veuillez entrer un numéro valide')
		.regex(/^\d[\d\s]*$/, 'Numéro invalide'),
})

export const otpSchema = z.object({
	otp: z.string().length(6, 'Entrez le code complet à 6 chiffres'),
})

export const newPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, 'Le mot de passe doit contenir au moins 6 caractères.')
			.max(128),
		confirmPassword: z.string(),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas.',
		path: ['confirmPassword'],
	})
