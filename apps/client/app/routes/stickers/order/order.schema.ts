import { z } from 'zod'
import { PACKS, PAYMENT_METHODS } from './stickers-order.const'

const PACK_IDS = PACKS.map(p => p.id) as [string, ...string[]]
const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map(p => p.id) as [
	string,
	...string[],
]

export const stickerOrderSchema = z.object({
	packId: z.enum(PACK_IDS, { message: 'Sélectionnez un pack' }),
	name: z.string({ message: 'Votre nom est requis' }).min(2).max(120),
	phone: z
		.string({ message: 'Votre téléphone est requis' })
		.regex(/^\d{8,16}$/, 'Numéro invalide'),
	address: z
		.string({ message: "L'adresse de livraison est requise" })
		.min(5, 'Adresse trop courte')
		.max(200),
	city: z.string({ message: 'La ville est requise' }).min(2).max(120),
	paymentMethod: z.enum(PAYMENT_METHOD_IDS, {
		message: 'Sélectionnez un moyen de paiement',
	}),
	paymentPhone: z
		.string({ message: 'Le numéro de paiement est requis' })
		.regex(/^\d{8,16}$/, 'Numéro invalide'),
	couponCode: z.string().max(30).optional(),
})
