import { z } from 'zod'

export const adminCreateSchema = z.object({
	name: z.string().min(2, 'Minimum 2 caractères').max(80),
	email: z.string().email('Email invalide'),
	phone: z.preprocess(
		val => (val === '' ? undefined : val),
		z.string().max(20).optional(),
	),
	password: z.string().min(6, 'Minimum 6 caractères'),
	role: z.enum(['admin', 'moderator']),
})

export const adminUpdateRoleSchema = z.object({
	role: z.enum(['admin', 'moderator']),
})
