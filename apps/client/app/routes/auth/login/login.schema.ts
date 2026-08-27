import { z } from 'zod'
import { currentPasswordSchema } from '@app/contracts/shared'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

// Length only, on purpose: an account created before the assignable-prefix rule
// must still be able to sign in. See `isValidLocalNumber`.
export const loginSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
	password: currentPasswordSchema,
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginData = z.output<typeof loginSchema>
