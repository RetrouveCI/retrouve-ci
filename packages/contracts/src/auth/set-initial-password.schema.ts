import { z } from 'zod'
import { passwordSchema } from '../shared/password'

export const setInitialPasswordSchema = z.object({
	newPassword: passwordSchema,
})

export type SetInitialPasswordInput = z.input<typeof setInitialPasswordSchema>
export type SetInitialPasswordData = z.output<typeof setInitialPasswordSchema>
