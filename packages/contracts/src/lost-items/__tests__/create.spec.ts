import { describe, expect, it } from 'vitest'
import { ASSIGNABLE_PHONE_ERROR_MESSAGE } from '../../shared/phone'
import { createLostItemSchema } from '../create.schema'
import { MAX_PHOTOS, MIN_DESCRIPTION_LENGTH } from '../lost-items.const'

const VALID = {
	type: 'lost',
	category: 'phone',
	title: 'iPhone 13 perdu',
	description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
	ville: 'Abidjan',
	commune: 'Cocody',
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

describe('createLostItemSchema', () => {
	it('accepts a complete listing, trims every field and normalises the number', () => {
		const result = parse({
			title: '  iPhone 13 perdu  ',
			description: `  ${VALID.description}  `,
			ville: '  Abidjan  ',
			commune: '  Cocody  ',
			contactName: '  Jean Dupont  ',
			contactWhatsapp: '  07 00 00 00 00  ',
		})

		expect(result.data).toEqual({
			...VALID,
			contactWhatsapp: '+2250700000000',
		})
	})

	it('accepts a listing without a commune and without photos', () => {
		const { commune, ...withoutCommune } = VALID

		expect(createLostItemSchema.safeParse(withoutCommune).success).toBe(true)
	})

	it('accepts up to MAX_PHOTOS photos', () => {
		const photos = Array.from({ length: MAX_PHOTOS }, (_, i) => `photo-${i}`)

		expect(parse({ photos }).data?.photos).toEqual(photos)
	})

	it('answers in French for every blank a form can post', () => {
		expect(messageFor({ title: '' })).toBe(
			'Le titre doit contenir au moins 3 caractères',
		)
		expect(messageFor({ description: '' })).toBe(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
		expect(messageFor({ ville: '' })).toBe('Veuillez indiquer la ville')
		expect(messageFor({ contactName: '' })).toBe('Veuillez indiquer votre nom')
		expect(messageFor({ eventDate: '' })).toBe('La date est requise')
		expect(messageFor({ contactWhatsapp: '' })).toBe(
			ASSIGNABLE_PHONE_ERROR_MESSAGE,
		)
	})

	it('refuses each unknown enum value, in French', () => {
		expect(messageFor({ type: 'stolen' })).toBe("Type d'annonce invalide")
		expect(messageFor({ category: 'voiture' })).toBe('Catégorie invalide')
	})

	it('reports every ceiling in French', () => {
		expect(messageFor({ title: 'a'.repeat(121) })).toBe(
			'Maximum 120 caractères',
		)
		expect(messageFor({ description: 'a'.repeat(2001) })).toBe(
			'Maximum 2000 caractères',
		)
		expect(messageFor({ ville: 'a'.repeat(121) })).toBe(
			'Maximum 120 caractères',
		)
		expect(messageFor({ commune: 'a'.repeat(121) })).toBe(
			'Maximum 120 caractères',
		)
		expect(messageFor({ contactName: 'a'.repeat(121) })).toBe(
			'Maximum 120 caractères',
		)
	})

	// What `validateCreateLostItem` used to check in the domain, absorbed here:
	// whitespace never bought a description its twenty characters, and the photo
	// ceiling was enforced after the DTO had already let the array through.
	it('measures the description after trimming, as the domain validator did', () => {
		expect(messageFor({ description: 'a'.repeat(19) })).toBe(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
		expect(
			messageFor({ description: `${'a'.repeat(19)}${' '.repeat(20)}` }),
		).toBe(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
	})

	it('refuses more than MAX_PHOTOS photos, as the domain validator did', () => {
		const photos = Array.from({ length: MAX_PHOTOS + 1 }, (_, i) => `p-${i}`)

		expect(messageFor({ photos })).toBe(
			`Vous ne pouvez pas ajouter plus de ${MAX_PHOTOS} photos`,
		)
	})

	it('refuses a date that only looks like one', () => {
		expect(messageFor({ eventDate: '2026-02-31' })).toBe('Date invalide')
		expect(messageFor({ eventDate: '15/01/2026' })).toBe('Date invalide')
	})

	it('accepts the date shapes the two forms post', () => {
		expect(parse({ eventDate: '2026-01-15' }).success).toBe(true)
		expect(parse({ eventDate: '2026-01-15T18:30' }).success).toBe(true)
		expect(parse({ eventDate: '2026-01-15T18:30:00.000Z' }).success).toBe(true)
	})

	it('strips a field the schema does not know', () => {
		expect(parse({ userId: 'user-1' }).data).not.toHaveProperty('userId')
	})
})
