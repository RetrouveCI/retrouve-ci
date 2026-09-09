import { z } from 'zod'
import {
	currentPasswordSchema,
	fullNameSchema,
	otpCodeSchema,
	passwordSchema,
	withPasswordConfirmation,
} from '@app/contracts/shared'
import {
	ASSIGNABLE_PHONE_ERROR_MESSAGE,
	isAssignableLocalNumber,
} from '@/shared/utils/phone'

export const updateNameSchema = z.object({
	intent: z.literal('update-name'),
	name: fullNameSchema,
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
		.refine(isAssignableLocalNumber, ASSIGNABLE_PHONE_ERROR_MESSAGE),
})

export const deleteAccountSchema = z.object({
	intent: z.literal('delete-account'),
	password: currentPasswordSchema,
})

// Flat, because a form posts flat fields; the service reassembles the nested
// shape `@app/contracts/notifications` declares. The browser produced all three,
// so the bounds live server-side where the contract enforces them.
export const subscribePushSchema = z.object({
	intent: z.literal('subscribe-push'),
	endpoint: z.string().min(1),
	p256dh: z.string().min(1),
	auth: z.string().min(1),
})

export const unsubscribePushSchema = z.object({
	intent: z.literal('unsubscribe-push'),
	endpoint: z.string().min(1),
})

export const settingsActionSchema = z.discriminatedUnion('intent', [
	updateNameSchema,
	updateZoneSchema,
	sendPhoneOtpSchema,
	deleteAccountSchema,
	subscribePushSchema,
	unsubscribePushSchema,
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
