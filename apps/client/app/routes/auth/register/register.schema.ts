import { z } from 'zod'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

export const phoneNumberSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
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

export const sendOtpActionSchema = z.object({
	intent: z.literal('send-otp'),
	phoneNumber: z.string(),
})

export const setInitialPasswordActionSchema = z.object({
	intent: z.literal('set-initial-password'),
	newPassword: z
		.string()
		.min(6, 'Le mot de passe doit contenir au moins 6 caractères.')
		.max(128),
})

export type PhoneNumberInput = z.input<typeof phoneNumberSchema>
export type PhoneNumberData = z.output<typeof phoneNumberSchema>

export type OtpInput = z.input<typeof otpSchema>
export type OtpData = z.output<typeof otpSchema>

export type NewPasswordInput = z.input<typeof newPasswordSchema>
export type NewPasswordData = z.output<typeof newPasswordSchema>
