import { describe, expect, it } from 'vitest'
import { createLostItemSchema } from '../create.schema'
import { BANK_CARD_DIGITS, MIN_DESCRIPTION_LENGTH } from '../lost-items.const'
import { updateLostItemSchema } from '../update.schema'

const VALID = {
	type: 'found',
	category: 'documents',
	title: 'CNI trouvée à Cocody',
	description: 'Trouvée devant la pharmacie, remise au commissariat',
	ville: 'Abidjan',
	eventDate: '2026-01-15',
	contactName: 'Jean Dupont',
	contactWhatsapp: '0700000000',
}

const parse = (overrides: Record<string, unknown> = {}) =>
	createLostItemSchema.safeParse({ ...VALID, ...overrides })

const messageFor = (overrides: Record<string, unknown>) => {
	const result = parse(overrides)
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('document fields on a creation', () => {
	/** Whoever lost the card no longer holds the number it carried. */
	it('publishes a piece of ID with no number at all', () => {
		const result = parse({
			documentType: 'national_id',
			documentHolderName: 'KOUASSI Jean',
		})

		expect(result.success).toBe(true)
		expect(result.data?.documentNumber).toBeUndefined()
	})

	it('accepts the four fields together', () => {
		expect(
			parse({
				documentType: 'insurance_card',
				documentHolderName: '  KOUASSI Jean  ',
				documentNumber: '  POL-2026-0042  ',
				documentIssuer: '  NSIA  ',
			}).data,
		).toMatchObject({
			documentType: 'insurance_card',
			documentHolderName: 'KOUASSI Jean',
			documentNumber: 'POL-2026-0042',
			documentIssuer: 'NSIA',
		})
	})

	it('demands the holder as soon as the block is opened', () => {
		expect(messageFor({ documentType: 'national_id' })).toBe(
			'Le nom du titulaire est requis pour une pièce',
		)
		expect(messageFor({ documentNumber: 'CI0012345678' })).toBe(
			'Le nom du titulaire est requis pour une pièce',
		)
		expect(messageFor({ documentIssuer: 'SIB' })).toBe(
			'Le nom du titulaire est requis pour une pièce',
		)
	})

	it('leaves a listing that opens no document block alone', () => {
		expect(parse().success).toBe(true)
		expect(parse({ documentHolderName: '' }).success).toBe(true)
	})

	/** The PAN would drag PCI-DSS into a service that has no use for it. */
	it('takes only the last four digits of a bank card', () => {
		const expected = `Pour une carte bancaire, indiquez seulement les ${BANK_CARD_DIGITS} derniers chiffres`

		expect(
			messageFor({
				documentType: 'bank_card',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: '4970100012345678',
			}),
		).toBe(expected)
		expect(
			messageFor({
				documentType: 'bank_card',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: '56',
			}),
		).toBe(expected)
		expect(
			parse({
				documentType: 'bank_card',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: '5678',
				documentIssuer: 'SGBCI',
			}).success,
		).toBe(true)
	})

	it('refuses a document type it does not know, in French', () => {
		expect(
			messageFor({
				documentType: 'carte_vitale',
				documentHolderName: 'KOUASSI Jean',
			}),
		).toBe('Type de pièce invalide')
	})

	/** A wallet handed in with a card inside is the most common find of all. */
	it('accepts a document block outside the documents category', () => {
		expect(
			parse({
				category: 'wallet',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
			}).success,
		).toBe(true)
	})
})

describe('the description floor', () => {
	it('still holds for anything that is not a described piece of ID', () => {
		const expected = `La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`

		expect(messageFor({ description: 'Trop court' })).toBe(expected)
		expect(messageFor({ description: '', documentType: 'national_id' })).toBe(
			'Le nom du titulaire est requis pour une pièce',
		)
		expect(
			messageFor({ description: '', documentHolderName: 'KOUASSI Jean' }),
		).toBe(expected)
	})

	it('lifts for a piece of ID that names its type and its holder', () => {
		expect(
			parse({
				description: '',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
			}).success,
		).toBe(true)
	})
})

describe('document fields on an update', () => {
	it('does not demand the holder again, the row already carries it', () => {
		expect(
			updateLostItemSchema.safeParse({ documentNumber: 'CI0012345678' })
				.success,
		).toBe(true)
	})

	it('keeps the bank card rule', () => {
		const result = updateLostItemSchema.safeParse({
			documentType: 'bank_card',
			documentNumber: '4970100012345678',
		})

		expect(result.success).toBe(false)
	})

	/** Unrepeated here, an edit would shorten what a creation refuses. */
	it('keeps the description floor an edit could otherwise slip under', () => {
		expect(
			updateLostItemSchema.safeParse({ description: 'Trop court' }).success,
		).toBe(false)
		expect(
			updateLostItemSchema.safeParse({
				description: 'Trop court',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
			}).success,
		).toBe(true)
	})
})
