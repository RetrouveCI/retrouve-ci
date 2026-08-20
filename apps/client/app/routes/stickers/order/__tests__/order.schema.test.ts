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
		expect(messageFor({ phone: '' })).toBe('Numéro invalide')
		expect(messageFor({ address: '' })).toBe('Adresse trop courte')
		expect(messageFor({ city: '' })).toBe('La ville est requise')
		expect(messageFor({ paymentMethod: '' })).toBe(
			'Sélectionnez un moyen de paiement',
		)
		expect(messageFor({ paymentPhone: '' })).toBe('Numéro invalide')
	})

	it('rejects a pack or a payment method that is not on offer', () => {
		expect(messageFor({ packId: 'pack-inexistant' })).toBe(
			'Sélectionnez un pack',
		)
		expect(messageFor({ paymentMethod: 'bitcoin' })).toBe(
			'Sélectionnez un moyen de paiement',
		)
	})

	it('accepts a phone of 8 to 16 digits and nothing else', () => {
		expect(
			stickerOrderSchema.safeParse({ ...VALID, phone: '01234567' }).success,
		).toBe(true)
		expect(messageFor({ phone: '0123456' })).toBe('Numéro invalide')
		expect(messageFor({ phone: '0'.repeat(17) })).toBe('Numéro invalide')
		expect(messageFor({ phone: '07 00 00 00 00' })).toBe('Numéro invalide')
	})

	it('treats the coupon as optional, blank included', () => {
		expect(stickerOrderSchema.safeParse(VALID).data?.couponCode).toBe('')

		const { couponCode: _couponCode, ...withoutCoupon } = VALID
		expect(stickerOrderSchema.safeParse(withoutCoupon).success).toBe(true)
		expect(messageFor({ couponCode: 'C'.repeat(31) })).toBe(
			'Maximum 30 caractères',
		)
	})
})
