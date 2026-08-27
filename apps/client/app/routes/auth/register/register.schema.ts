import { z } from 'zod'
import {
	otpCodeSchema,
	passwordSchema,
	withPasswordConfirmation,
} from '@app/contracts/shared'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

export const phoneNumberSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
})

export const otpSchema = z.object({
	otp: otpCodeSchema,
})

export const newPasswordSchema = withPasswordConfirmation(
	z.object({
		newPassword: passwordSchema,
		confirmPassword: z.string(),
	}),
)

export const sendOtpActionSchema = z.object({
	intent: z.literal('send-otp'),
	phoneNumber: z.string(),
})

export const setInitialPasswordActionSchema = z.object({
	intent: z.literal('set-initial-password'),
	newPassword: passwordSchema,
})

export type PhoneNumberInput = z.input<typeof phoneNumberSchema>
export type PhoneNumberData = z.output<typeof phoneNumberSchema>

export type OtpInput = z.input<typeof otpSchema>
export type OtpData = z.output<typeof otpSchema>

export type NewPasswordInput = z.input<typeof newPasswordSchema>
export type NewPasswordData = z.output<typeof newPasswordSchema>
