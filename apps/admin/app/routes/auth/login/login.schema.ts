import { z } from 'zod'

export const loginSchema = z.object({
	email: z.email('Email invalide'),
	password: z.string().min(1, 'Mot de passe requis'),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginData = z.output<typeof loginSchema>
