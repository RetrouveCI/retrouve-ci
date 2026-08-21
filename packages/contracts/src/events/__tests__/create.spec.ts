import { describe, expect, it } from 'vitest'
import { createEventSchema } from '../create.schema'

const VALID = {
	title: 'Braderie du Plateau',
	description: 'Une braderie solidaire ouverte à tous les habitants.',
	location: 'Place de la République',
	ville: 'Abidjan',
	commune: 'Plateau',
	eventDate: '2026-09-01T18:30',
}

const messageFor = (overrides: Record<string, unknown>) => {
	const result = createEventSchema.safeParse({ ...VALID, ...overrides })
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('createEventSchema', () => {
	it('accepts a complete event and trims every field', () => {
		const result = createEventSchema.safeParse({
			title: '  Braderie du Plateau  ',
			description: `  ${VALID.description}  `,
			location: '  Place de la République  ',
			ville: '  Abidjan  ',
			commune: '  Plateau  ',
			eventDate: '  2026-09-01T18:30  ',
		})

		expect(result.data).toEqual(VALID)
	})

	it('accepts an event without a commune', () => {
		const { commune, ...withoutCommune } = VALID

		expect(createEventSchema.safeParse(withoutCommune).success).toBe(true)
	})

	it('answers in French for every blank a form can post', () => {
		expect(messageFor({ title: '' })).toBe(
			'Le titre doit contenir au moins 3 caractères',
		)
		expect(messageFor({ description: '' })).toBe(
			'La description doit contenir au moins 10 caractères',
		)
		expect(messageFor({ location: '' })).toBe('Veuillez indiquer le lieu')
		expect(messageFor({ ville: '' })).toBe('Veuillez indiquer la ville')
		expect(messageFor({ eventDate: '' })).toBe('La date est requise')
	})

	// What `validateCreateEvent` used to check in the domain: whitespace never
	// bought a description its ten characters.
	it('measures the description after trimming, as the domain validator did', () => {
		expect(messageFor({ description: 'Court' })).toBe(
			'La description doit contenir au moins 10 caractères',
		)
		expect(messageFor({ description: `Court${' '.repeat(20)}` })).toBe(
			'La description doit contenir au moins 10 caractères',
		)
	})

	it.each([
		['title', 120, 'Maximum 120 caractères'],
		['description', 2000, 'Maximum 2000 caractères'],
		['location', 200, 'Maximum 200 caractères'],
		['ville', 120, 'Maximum 120 caractères'],
		['commune', 120, 'Maximum 120 caractères'],
	])('caps %s at %i characters', (field, max, expected) => {
		expect(messageFor({ [field]: 'a'.repeat(max + 1) })).toBe(expected)
		expect(
			createEventSchema.safeParse({ ...VALID, [field]: 'a'.repeat(max) })
				.success,
		).toBe(true)
	})

	// `datetime-local` posts no seconds and no offset; an API caller posts both.
	it.each([
		'2026-09-01',
		'2026-09-01T18:30',
		'2026-09-01T18:30:00',
		'2026-09-01T18:30:00.000Z',
		'2026-09-01T18:30:00+00:00',
	])('accepts the date shape %s', eventDate => {
		expect(createEventSchema.safeParse({ ...VALID, eventDate }).success).toBe(
			true,
		)
	})

	it.each([
		'01/09/2026',
		'2026',
		'2026-13-01',
		'2026-02-31',
		'2026-09-01T25:00',
		'demain',
	])('refuses the date %s, in French', eventDate => {
		expect(messageFor({ eventDate })).toBe('Date invalide')
	})
})
