import { z } from 'zod'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

export const loginSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
	password: z.string().min(4, 'Mot de passe trop court.'),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginData = z.output<typeof loginSchema>
