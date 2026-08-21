import { z } from 'zod'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

export const phoneNumberSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
})

export type PhoneNumberInput = z.input<typeof phoneNumberSchema>
export type PhoneNumberData = z.output<typeof phoneNumberSchema>
