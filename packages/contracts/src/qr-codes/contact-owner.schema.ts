import { z } from 'zod'
import {
	ASSIGNABLE_PHONE_ERROR_MESSAGE,
	isAssignableLocalNumber,
} from '../shared/phone'

export const contactOwnerSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Veuillez entrer votre nom complet')
		.max(100, 'Maximum 100 caractères'),
	phone: z
		.string()
		.trim()
		.refine(isAssignableLocalNumber, ASSIGNABLE_PHONE_ERROR_MESSAGE),
	email: z
		.string()
		.trim()
		.pipe(z.email('Veuillez entrer un email valide'))
		.optional()
		.or(z.literal('')),
	message: z
		.string()
		.trim()
		.min(5, 'Votre message doit contenir au moins 5 caractères')
		.max(500, 'Votre message ne peut pas dépasser 500 caractères'),
})

export type ContactOwnerInput = z.input<typeof contactOwnerSchema>
export type ContactOwnerData = z.output<typeof contactOwnerSchema>
