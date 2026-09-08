import { describe, expect, it } from 'vitest'
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, fullNameSchema } from '../name'

const messageFor = (value: unknown) =>
	fullNameSchema.safeParse(value).error?.issues[0]?.message

describe('fullNameSchema', () => {
	it('accepts a name and hands it back trimmed', () => {
		expect(fullNameSchema.parse('  Adjoua Konan  ')).toBe('Adjoua Konan')
	})

	// ⚠️ The account's edit form had no `.trim()`.
	it('refuses whitespace that would pass the floor untrimmed', () => {
		expect(messageFor('  A  ')).toBe('Votre nom est requis')
	})

	it.each([undefined, null, '', 'A'])('refuses %p', value => {
		expect(messageFor(value)).toBe('Votre nom est requis')
	})

	it('accepts a name exactly at the floor', () => {
		expect(fullNameSchema.parse('Ah')).toBe('Ah')
	})

	it('accepts a name exactly at the ceiling', () => {
		const longest = 'a'.repeat(NAME_MAX_LENGTH)

		expect(fullNameSchema.parse(longest)).toBe(longest)
	})

	it('refuses one character past it, in French', () => {
		expect(messageFor('a'.repeat(NAME_MAX_LENGTH + 1))).toBe(
			'Votre nom est trop long',
		)
	})

	it.each([null, '', 'A', 'a'.repeat(NAME_MAX_LENGTH + 1)])(
		'answers in French for %p',
		value => {
			expect(messageFor(value)).toMatch(/^Votre nom/)
		},
	)

	// ⚠️ Literals: every other case derives its expectation from these constants,
	// so changing one moved both sides and left the suite green.
	it('holds the floor at 2 and the ceiling at 120', () => {
		expect(NAME_MIN_LENGTH).toBe(2)
		expect(NAME_MAX_LENGTH).toBe(120)
	})
})
