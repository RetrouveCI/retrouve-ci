import { z } from 'zod'

export const loginSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.min(8, 'Veuillez entrer un numéro valide')
		.regex(/^\d[\d\s]*$/, 'Numéro invalide'),
	password: z.string().min(4, 'Mot de passe trop court.'),
})
