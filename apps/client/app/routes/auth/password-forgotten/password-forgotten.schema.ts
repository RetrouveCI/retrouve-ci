import { z } from 'zod'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

// Length only, like sign-in: recovery reads an existing account, so it accepts
// whatever that account already carries. See `isValidLocalNumber`.
export const phoneNumberSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
})

export type PhoneNumberInput = z.input<typeof phoneNumberSchema>
export type PhoneNumberData = z.output<typeof phoneNumberSchema>
