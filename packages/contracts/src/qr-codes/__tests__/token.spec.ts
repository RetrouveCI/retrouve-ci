import { describe, expect, it } from 'vitest'
import { directContactSchema, qrTokenDetailsSchema } from '../token.schema'

const parse = (input: unknown) => qrTokenDetailsSchema.safeParse(input)

describe('qrTokenDetailsSchema', () => {
	// It serves both `activate` and `update`, whose two DTOs were identical.
	it('accepts an empty body, since both fields are optional', () => {
		expect(parse({}).data).toEqual({})
	})

	it('trims what it keeps', () => {
		expect(parse({ label: '  Clés de voiture  ' }).data).toEqual({
			label: 'Clés de voiture',
		})
	})

	it.each([
		['label', 60, 'Maximum 60 caractères'],
		['linkedObject', 120, 'Maximum 120 caractères'],
	])('caps %s at %i characters', (field, max, expected) => {
		const tooLong = parse({ [field]: 'a'.repeat(max + 1) })

		expect(tooLong.success).toBe(false)
		expect(tooLong.error?.issues[0]?.message).toBe(expected)
		expect(parse({ [field]: 'a'.repeat(max) }).success).toBe(true)
	})

	// Absent is not `false`: `update` leaves a stored consent alone, where a
	// posted `false` withdraws it.
	it('keeps an absent consent absent', () => {
		expect(parse({ label: 'Clés' }).data).toEqual({ label: 'Clés' })
	})
})

describe('directContactSchema', () => {
	it.each([
		[true, true],
		[false, false],
		['true', true],
		['false', false],
	])('reads %o as %o', (input, expected) => {
		expect(directContactSchema.parse(input)).toBe(expected)
	})

	// A bare `z.union` reports « Invalid input » in English.
	it.each(['on', 'oui', '1', 1, null])('refuses %o in French', input => {
		const result = directContactSchema.safeParse(input)

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Doit valoir true ou false')
	})
})
