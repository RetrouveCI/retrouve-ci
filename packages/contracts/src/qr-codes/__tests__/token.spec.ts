import { describe, expect, it } from 'vitest'
import { qrTokenDetailsSchema } from '../token.schema'

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
})
