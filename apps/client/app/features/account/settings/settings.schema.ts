import { z } from 'zod'

export const deleteAccountSchema = z.object({
	intent: z.literal('delete-account'),
	password: z.string().min(1, 'Mot de passe requis'),
})

export const settingsActionSchema = z.discriminatedUnion('intent', [
	deleteAccountSchema,
])
