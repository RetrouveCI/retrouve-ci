import { z } from 'zod'

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

export const resendOtpActionSchema = z.object({
	intent: z.literal('resend-otp'),
	phoneNumber: z.string(),
})

export const resetPasswordActionSchema = z.object({
	intent: z.literal('reset-password'),
	phoneNumber: z.string(),
	otp: z.string().length(6),
	newPassword: z.string().min(6).max(128),
})
