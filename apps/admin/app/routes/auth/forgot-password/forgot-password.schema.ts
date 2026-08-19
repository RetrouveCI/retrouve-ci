import { z } from 'zod'

export const forgotPasswordSchema = z.object({
	email: z.email('Email invalide'),
})

export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>
export type ForgotPasswordData = z.output<typeof forgotPasswordSchema>
