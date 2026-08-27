import { z } from 'zod'

export const createContactMessageSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Veuillez entrer votre nom complet')
		.max(100, 'Maximum 100 caractères'),
	email: z.string().trim().pipe(z.email('Veuillez entrer un email valide')),
	subject: z
		.string()
		.trim()
		.min(2, 'Veuillez entrer un sujet')
		.max(150, 'Maximum 150 caractères'),
	message: z
		.string()
		.trim()
		.min(10, 'Votre message doit contenir au moins 10 caractères')
		.max(2000, 'Maximum 2000 caractères'),
})

export type CreateContactMessageInput = z.input<
	typeof createContactMessageSchema
>
export type CreateContactMessageData = z.output<
	typeof createContactMessageSchema
>
