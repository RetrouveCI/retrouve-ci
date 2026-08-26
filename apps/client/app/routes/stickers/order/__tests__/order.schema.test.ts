import { PHONE_ERROR_MESSAGE } from '@app/contracts/shared'
import { stickerOrderSchema } from '../order.schema'
import { PACKS, PAYMENT_METHODS } from '../stickers-order.const'

const VALID = {
	packId: PACKS[0]!.id,
	name: 'Kouadio Jean',
	phone: '0700000000',
	address: 'Cocody Riviera 2, près de la pharmacie',
	city: 'Abidjan',
	paymentMethod: PAYMENT_METHODS[0]!.id,
	paymentPhone: '0700000000',
	couponCode: '',
}

function messageFor(overrides: Record<string, unknown>) {
	const result = stickerOrderSchema.safeParse({ ...VALID, ...overrides })
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('stickerOrderSchema', () => {
	it('accepts a complete order', () => {
		const result = stickerOrderSchema.safeParse(VALID)

		expect(result.success).toBe(true)
		expect(result.data?.packId).toBe(PACKS[0]!.id)
	})

	// The form posts a blank for every untouched field, so these are the messages
	// an empty step actually shows — none of them may fall back to zod's English.
	it('answers in French for every blank the form can post', () => {
		expect(messageFor({ packId: '' })).toBe('Sélectionnez un pack')
		expect(messageFor({ name: '' })).toBe('Votre nom est requis')
		expect(messageFor({ phone: '' })).toBe(PHONE_ERROR_MESSAGE)
		expect(messageFor({ address: '' })).toBe('Adresse trop courte')
		expect(messageFor({ city: '' })).toBe('La ville est requise')
		expect(messageFor({ paymentMethod: '' })).toBe(
			'Sélectionnez un moyen de paiement',
		)
		expect(messageFor({ paymentPhone: '' })).toBe(PHONE_ERROR_MESSAGE)
	})

	it('rejects a pack or a payment method that is not on offer', () => {
		expect(messageFor({ packId: 'pack-inexistant' })).toBe(
			'Sélectionnez un pack',
		)
		expect(messageFor({ paymentMethod: 'bitcoin' })).toBe(
			'Sélectionnez un moyen de paiement',
		)
	})

	/**
	 * The shared ivorian rule, as every other phone field in the app uses it.
	 * `/^\d{8,16}$/` used to live here instead: it accepted the eight digits
	 * below — a number nobody can be reached on — and refused the spaced form a
	 * visitor is most likely to type.
	 */
	it.each(['phone', 'paymentPhone'] as const)(
		'holds %s to the shared ten-digit rule',
		field => {
			expect(messageFor({ [field]: '01234567' })).toBe(PHONE_ERROR_MESSAGE)
			expect(messageFor({ [field]: '0'.repeat(17) })).toBe(PHONE_ERROR_MESSAGE)
			expect(messageFor({ [field]: 'pas-un-numero' })).toBe(PHONE_ERROR_MESSAGE)
		},
	)

	it.each(['0700000000', '07 00 00 00 00', '+2250700000000', '2250700000000'])(
		'accepts the number %p, spacing and country code included',
		phone => {
			expect(stickerOrderSchema.safeParse({ ...VALID, phone }).success).toBe(
				true,
			)
		},
	)

	it('treats the coupon as optional, blank included', () => {
		expect(stickerOrderSchema.safeParse(VALID).data?.couponCode).toBe('')

		const { couponCode: _couponCode, ...withoutCoupon } = VALID
		expect(stickerOrderSchema.safeParse(withoutCoupon).success).toBe(true)
		expect(messageFor({ couponCode: 'C'.repeat(31) })).toBe(
			'Maximum 30 caractères',
		)
	})
})
