import { z } from 'zod'
import {
	otpCodeSchema,
	passwordSchema,
	withPasswordConfirmation,
} from '@app/contracts/shared'

/**
 * One screen, one schema: the code and the new password are checked together
 * because they travel in the single `/phone-number/reset-password` call. Split
 * over two steps, a code the API refused cost the visitor the password they had
 * already typed.
 */
export const resetPasswordFormSchema = withPasswordConfirmation(
	z.object({
		otp: otpCodeSchema,
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

export type ResetPasswordFormInput = z.input<typeof resetPasswordFormSchema>
export type ResetPasswordFormData = z.output<typeof resetPasswordFormSchema>
