import { describe, expect, it } from 'vitest'
import { createStickerOrderSchema } from '../create.schema'

const VALID = {
	packId: 'pack-8',
	paymentMethod: 'orange-money',
	deliveryAddress: 'Cocody Riviera 3, Abidjan',
	deliveryCity: 'Abidjan',
	deliveryNotes: 'Portail bleu, deuxième étage',
	couponCode: 'RETROUVECI',
}

const messageFor = (overrides: Record<string, unknown>) => {
	const result = createStickerOrderSchema.safeParse({ ...VALID, ...overrides })
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('createStickerOrderSchema', () => {
	it('accepts a complete order and trims every field', () => {
		const result = createStickerOrderSchema.safeParse({
			packId: 'pack-8',
			paymentMethod: '  orange-money  ',
			deliveryAddress: '  Cocody Riviera 3, Abidjan  ',
			deliveryCity: '  Abidjan  ',
			deliveryNotes: '  Portail bleu, deuxième étage  ',
			couponCode: '  RETROUVECI  ',
		})

		expect(result.data).toEqual(VALID)
	})

	it('accepts an order without notes or coupon', () => {
		const { deliveryNotes, couponCode, ...bare } = VALID

		expect(createStickerOrderSchema.safeParse(bare).success).toBe(true)
	})

	// What `validateCreateStickerOrder` used to check in the domain, before the
	// use-case could reach for a pack that did not exist.
	it.each(['pack-4', 'pack-8', 'pack-20'])('accepts the pack %s', packId => {
		expect(
			createStickerOrderSchema.safeParse({ ...VALID, packId }).success,
		).toBe(true)
	})

	it.each(['pack-unknown', 'pack-40', '', 'PACK-4'])(
		'refuses the pack %s, in French',
		packId => {
			expect(messageFor({ packId })).toBe('Sélectionnez un pack')
		},
	)

	it('answers in French for every blank a form can post', () => {
		expect(messageFor({ paymentMethod: '' })).toBe(
			'Sélectionnez un moyen de paiement',
		)
		expect(messageFor({ deliveryAddress: '' })).toBe('Adresse trop courte')
		expect(messageFor({ deliveryCity: '' })).toBe('La ville est requise')
	})

	it.each([
		['paymentMethod', 60, 'Maximum 60 caractères'],
		['deliveryAddress', 200, 'Maximum 200 caractères'],
		['deliveryCity', 120, 'Maximum 120 caractères'],
		['deliveryNotes', 500, 'Maximum 500 caractères'],
		['couponCode', 30, 'Maximum 30 caractères'],
	])('caps %s at %i characters', (field, max, expected) => {
		expect(messageFor({ [field]: 'a'.repeat(max + 1) })).toBe(expected)
		expect(
			createStickerOrderSchema.safeParse({
				...VALID,
				[field]: 'a'.repeat(max),
			}).success,
		).toBe(true)
	})

	// An unrecognised coupon is not an error: it simply buys no free delivery,
	// which `computeDeliveryFee` decides, not the contract.
	it('accepts a coupon it does not know', () => {
		expect(
			createStickerOrderSchema.safeParse({ ...VALID, couponCode: 'PASUNCODE' })
				.success,
		).toBe(true)
	})
})
