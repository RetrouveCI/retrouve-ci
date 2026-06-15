import { z } from 'zod'

export const phoneNumberSchema = z.object({
	phoneNumber: z
		.string()
		.trim()
		.min(8, 'Veuillez entrer un numéro valide')
		.regex(/^\d[\d\s]*$/, 'Numéro invalide'),
})
