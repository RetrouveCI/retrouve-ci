import { z } from 'zod'
import type { LostItemCategory } from '@/shared/types/lost-item'
import { OBJECT_TYPES } from './publish.const'

const CATEGORY_VALUES = OBJECT_TYPES.map(o => o.value) as [
	LostItemCategory,
	...LostItemCategory[],
]

export const publishFormSchema = z.object({
	title: z
		.string({ message: 'Le titre est requis' })
		.min(3, 'Le titre doit contenir au moins 3 caractères')
		.max(120),
	objectType: z.enum(CATEGORY_VALUES, {
		message: "Sélectionnez un type d'objet",
	}),
	description: z
		.string({ message: 'La description est requise' })
		.min(20, 'La description doit contenir au moins 20 caractères')
		.max(2000),
	ville: z.string({ message: 'Sélectionnez une ville' }).min(1, {
		message: 'Sélectionnez une ville',
	}),
	commune: z.string().optional(),
	date: z.string().optional(),
	name: z
		.string({ message: 'Votre nom est requis' })
		.min(2, 'Votre nom est requis')
		.max(120),
	whatsapp: z
		.string({ message: 'Votre numéro WhatsApp est requis' })
		.regex(/^\d{8,16}$/, 'Numéro WhatsApp invalide (8 à 16 chiffres)'),
})
