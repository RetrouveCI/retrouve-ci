import { z } from 'zod'
import { currentPasswordSchema } from '@app/contracts/shared'

export const loginSchema = z.object({
	email: z.email('Email invalide'),
	password: currentPasswordSchema,
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginData = z.output<typeof loginSchema>
