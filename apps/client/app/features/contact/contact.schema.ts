import { z } from 'zod'

export const contactSchema = z.object({
	name: z.string().trim().min(2, 'Veuillez entrer votre nom complet'),
	email: z.string().trim().email('Veuillez entrer un email valide'),
	subject: z.string().trim().min(2, 'Veuillez entrer un sujet'),
	message: z
		.string()
		.trim()
		.min(10, 'Votre message doit contenir au moins 10 caractères')
		.max(2000),
})
