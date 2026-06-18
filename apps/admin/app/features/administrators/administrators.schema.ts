import { z } from 'zod'

export const adminCreateSchema = z.object({
	name: z
		.string({ required_error: 'Le nom est requis' })
		.min(2, 'Minimum 2 caractères')
		.max(80),
	email: z
		.string({ required_error: "L'email est requis" })
		.email('Email invalide'),
	phone: z.preprocess(
		val => (val === '' ? undefined : val),
		z.string().max(20).optional(),
	),
	password: z
		.string({ required_error: 'Le mot de passe est requis' })
		.min(6, 'Minimum 6 caractères'),
	role: z.enum(['admin', 'moderator']),
})

export const adminUpdateRoleSchema = z.object({
	role: z.enum(['admin', 'moderator']),
})
