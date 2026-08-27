import {
	LOST_ITEM_CATEGORIES,
	MIN_DESCRIPTION_LENGTH,
} from '@app/contracts/lost-items'
import { ASSIGNABLE_PHONE_ERROR_MESSAGE } from '@app/contracts/shared'
import { publishFormSchema } from '../publish.schema'
import { OBJECT_TYPES } from '../publish.const'

const VALID = {
	title: 'iPhone 13 perdu',
	objectType: 'phone',
	description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
	ville: 'Abidjan',
	commune: 'Cocody',
	date: '2026-01-15',
	name: 'Jean Dupont',
	whatsapp: '0700000000',
}

const parse = (overrides: Record<string, unknown> = {}) =>
	publishFormSchema.safeParse({ ...VALID, ...overrides })

const messageFor = (overrides: Record<string, unknown>) => {
	const result = parse(overrides)
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('publishFormSchema', () => {
	it('accepts a complete form', () => {
		expect(parse().data).toEqual(VALID)
	})

	it('accepts a form without a commune', () => {
		const { commune, ...withoutCommune } = VALID

		expect(publishFormSchema.safeParse(withoutCommune).success).toBe(true)
	})

	it('answers in French for every field a visitor can leave blank', () => {
		expect(messageFor({ title: '' })).toBe(
			'Le titre doit contenir au moins 3 caractères',
		)
		expect(messageFor({ objectType: '' })).toBe("Sélectionnez un type d'objet")
		expect(messageFor({ description: '' })).toBe(
			`La description doit contenir au moins ${MIN_DESCRIPTION_LENGTH} caractères`,
		)
		expect(messageFor({ ville: '' })).toBe('Sélectionnez une ville')
		expect(messageFor({ name: '' })).toBe('Votre nom est requis')
		expect(messageFor({ whatsapp: '' })).toBe(ASSIGNABLE_PHONE_ERROR_MESSAGE)
	})

	// The date used to be optional here while the API required it, so the action
	// silently sent today's date for anyone who skipped the field.
	it('requires the date', () => {
		expect(messageFor({ date: '' })).toBe('Indiquez la date')
	})

	it('refuses a date that only looks like one', () => {
		expect(messageFor({ date: '2026-02-31' })).toBe('Date invalide')
	})

	it.each(LOST_ITEM_CATEGORIES)('accepts the %s category', objectType => {
		expect(parse({ objectType }).success).toBe(true)
	})

	it('refuses a category the contract does not know', () => {
		expect(messageFor({ objectType: 'voiture' })).toBe('Catégorie invalide')
	})

	// The field shows a fixed `+225` and a spaced placeholder, which the old
	// `/^\d{8,16}$/` refused while accepting numbers of the wrong length.
	it.each(['07 00 00 00 00', '2250700000000', '+2250700000000'])(
		'accepts %s, whatever shape it was typed in',
		whatsapp => {
			expect(parse({ whatsapp }).success).toBe(true)
		},
	)

	// Ten digits is no longer enough: the number has to be one an operator
	// assigns, or the WhatsApp link the annonce carries reaches nobody.
	it.each([
		'070000000',
		'07000000000',
		'0700000000123456',
		'0600000000',
		'0000000000',
		'1234567890',
	])('refuses %s, which is not an ivorian mobile number', whatsapp => {
		expect(messageFor({ whatsapp })).toBe(ASSIGNABLE_PHONE_ERROR_MESSAGE)
	})

	// The form hands over what the visitor typed; `contactWhatsappSchema` is the
	// single place the number becomes E.164, so the client no longer prefixes
	// `+225` onto a number that may already carry it.
	it('passes the number on unrewritten, spacing and all', () => {
		expect(parse({ whatsapp: '  07 00 00 00 00  ' }).data?.whatsapp).toBe(
			'07 00 00 00 00',
		)
	})
})

describe('OBJECT_TYPES', () => {
	it('labels every category the contract carries, in the contract order', () => {
		expect(OBJECT_TYPES.map(o => o.value)).toEqual([...LOST_ITEM_CATEGORIES])
		expect(OBJECT_TYPES.every(o => o.label.length > 0)).toBe(true)
	})
})
