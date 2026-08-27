import { z } from 'zod'
import { stickerPackIdSchema } from '@app/contracts/sticker-orders'
import { isValidLocalNumber, PHONE_ERROR_MESSAGE } from '@/shared/utils/phone'

export const stickerOrderSchema = z.object({
	packId: z.string().min(1, 'Sélectionnez un pack').pipe(stickerPackIdSchema),
	name: z
		.string()
		.min(2, 'Votre nom est requis')
		.max(120, 'Maximum 120 caractères'),
	// The rule every other phone field in the app uses. `/^\d{8,16}$/` let an
	// eight-digit number through, so a delivery contact could be unreachable.
	phone: z.string().trim().refine(isValidLocalNumber, PHONE_ERROR_MESSAGE),
	address: z
		.string()
		.min(5, 'Adresse trop courte')
		.max(200, 'Maximum 200 caractères'),
	city: z
		.string()
		.min(2, 'La ville est requise')
		.max(120, 'Maximum 120 caractères'),
	couponCode: z.string().max(30, 'Maximum 30 caractères').optional(),
})

export type StickerOrderInput = z.input<typeof stickerOrderSchema>
export type StickerOrderData = z.output<typeof stickerOrderSchema>
