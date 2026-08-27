import { z } from 'zod'
import {
	otpCodeSchema,
	passwordSchema,
	withPasswordConfirmation,
} from '@app/contracts/shared'

export const otpSchema = z.object({
	otp: otpCodeSchema,
})

export const newPasswordSchema = withPasswordConfirmation(
	z.object({
		newPassword: passwordSchema,
		confirmPassword: z.string(),
	}),
)

export const resendOtpActionSchema = z.object({
	intent: z.literal('resend-otp'),
	phoneNumber: z.string(),
})

export const resetPasswordActionSchema = z.object({
	intent: z.literal('reset-password'),
	phoneNumber: z.string(),
	otp: otpCodeSchema,
	newPassword: passwordSchema,
})

export type OtpInput = z.input<typeof otpSchema>
export type OtpData = z.output<typeof otpSchema>

export type NewPasswordInput = z.input<typeof newPasswordSchema>
export type NewPasswordData = z.output<typeof newPasswordSchema>
