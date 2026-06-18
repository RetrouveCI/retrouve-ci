import { z } from 'zod'

export const updateNameSchema = z.object({
	intent: z.literal('update-name'),
	name: z
		.string({ message: 'Votre nom est requis' })
		.min(2, 'Votre nom est requis')
		.max(120),
})

export const updateZoneSchema = z.object({
	intent: z.literal('update-zone'),
	city: z.string({ message: 'Sélectionnez une ville' }).min(1, {
		message: 'Sélectionnez une ville',
	}),
	commune: z.string().optional(),
})

export const sendPhoneOtpSchema = z.object({
	intent: z.literal('send-phone-otp'),
	phone: z
		.string({ message: 'Votre numéro est requis' })
		.regex(/^\d{8,16}$/, 'Numéro invalide (8 à 16 chiffres)'),
})

export const deleteAccountSchema = z.object({
	intent: z.literal('delete-account'),
	password: z.string().min(1, 'Mot de passe requis'),
})

export const settingsActionSchema = z.discriminatedUnion('intent', [
	updateNameSchema,
	updateZoneSchema,
	sendPhoneOtpSchema,
	deleteAccountSchema,
])

// Client-side only (handled via authClient, not the route action).
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
		newPassword: z.string().min(6, '6 caractères minimum'),
		confirmPassword: z.string().min(1, 'Confirmation requise'),
	})
	.refine(data => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})

export const verifyPhoneSchema = z.object({
	code: z.string().regex(/^\d{4,8}$/, 'Code à 4-8 chiffres'),
})
