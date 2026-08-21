import { z } from 'zod'
import {
	currentPasswordSchema,
	otpCodeSchema,
	passwordSchema,
	withPasswordConfirmation,
} from '@app/contracts/shared'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

export const updateNameSchema = z.object({
	intent: z.literal('update-name'),
	name: z
		.string({ error: 'Votre nom est requis' })
		.min(2, 'Votre nom est requis')
		.max(120),
})

export const updateZoneSchema = z.object({
	intent: z.literal('update-zone'),
	city: z
		.string({ error: 'Sélectionnez une ville' })
		.min(1, { error: 'Sélectionnez une ville' }),
	commune: z.string().optional(),
})

export const sendPhoneOtpSchema = z.object({
	intent: z.literal('send-phone-otp'),
	phone: z
		.string({ error: 'Votre numéro est requis' })
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
})

export const deleteAccountSchema = z.object({
	intent: z.literal('delete-account'),
	password: currentPasswordSchema,
})

export const settingsActionSchema = z.discriminatedUnion('intent', [
	updateNameSchema,
	updateZoneSchema,
	sendPhoneOtpSchema,
	deleteAccountSchema,
])

// Client-side only (handled via authClient, not the route action).
export const changePasswordSchema = withPasswordConfirmation(
	z.object({
		currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, 'Confirmation requise'),
	}),
)

export const verifyPhoneSchema = z.object({
	code: otpCodeSchema,
})

export type UpdateNameInput = z.input<typeof updateNameSchema>
export type UpdateNameData = z.output<typeof updateNameSchema>

export type UpdateZoneInput = z.input<typeof updateZoneSchema>
export type UpdateZoneData = z.output<typeof updateZoneSchema>

export type SendPhoneOtpInput = z.input<typeof sendPhoneOtpSchema>
export type SendPhoneOtpData = z.output<typeof sendPhoneOtpSchema>

export type DeleteAccountInput = z.input<typeof deleteAccountSchema>
export type DeleteAccountData = z.output<typeof deleteAccountSchema>

export type ChangePasswordInput = z.input<typeof changePasswordSchema>
export type ChangePasswordData = z.output<typeof changePasswordSchema>

export type VerifyPhoneInput = z.input<typeof verifyPhoneSchema>
export type VerifyPhoneData = z.output<typeof verifyPhoneSchema>
