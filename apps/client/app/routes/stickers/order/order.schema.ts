import { z } from 'zod'
import { stickerPackIdSchema } from '@app/contracts/sticker-orders'
import { PAYMENT_METHODS } from './stickers-order.const'

const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map(method => method.id)

export const stickerOrderSchema = z.object({
	packId: z.string().min(1, 'Sélectionnez un pack').pipe(stickerPackIdSchema),
	name: z
		.string()
		.min(2, 'Votre nom est requis')
		.max(120, 'Maximum 120 caractères'),
	phone: z.string().regex(/^\d{8,16}$/, 'Numéro invalide'),
	address: z
		.string()
		.min(5, 'Adresse trop courte')
		.max(200, 'Maximum 200 caractères'),
	city: z
		.string()
		.min(2, 'La ville est requise')
		.max(120, 'Maximum 120 caractères'),
	paymentMethod: z.enum(PAYMENT_METHOD_IDS, {
		error: 'Sélectionnez un moyen de paiement',
	}),
	paymentPhone: z.string().regex(/^\d{8,16}$/, 'Numéro invalide'),
	couponCode: z.string().max(30, 'Maximum 30 caractères').optional(),
})

export type StickerOrderInput = z.input<typeof stickerOrderSchema>
export type StickerOrderData = z.output<typeof stickerOrderSchema>
