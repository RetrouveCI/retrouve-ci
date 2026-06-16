import { z } from 'zod'

export const adminFormSchema = z.object({
	name: z.string().min(2, 'Minimum 2 caractères').max(80),
	email: z.string().email('Email invalide'),
	phone: z.string().min(8, 'Numéro invalide').max(20),
	role: z.enum(['admin', 'moderator']),
})
