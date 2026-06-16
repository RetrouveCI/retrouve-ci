import { z } from 'zod'

export const qrContactSchema = z.object({
	name: z.string().trim().min(2, 'Veuillez entrer votre nom complet'),
	phone: z
		.string()
		.trim()
		.min(8, 'Veuillez entrer un numéro de téléphone valide'),
	email: z
		.string()
		.trim()
		.email('Veuillez entrer un email valide')
		.optional()
		.or(z.literal('')),
	message: z
		.string()
		.trim()
		.min(5, 'Votre message doit contenir au moins 5 caractères')
		.max(500, 'Votre message ne peut pas dépasser 500 caractères'),
})
