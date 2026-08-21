import { describe, expect, it } from 'vitest'
import { generateQrTokensSchema } from '../generate.schema'
import { MAX_GENERATE_COUNT, MIN_GENERATE_COUNT } from '../qr-codes.const'

const parse = (input: unknown) => generateQrTokensSchema.safeParse(input)

const messageFor = (input: unknown) => {
	const result = parse(input)
	if (result.success) throw new Error('expected the schema to reject the input')
	return result.error.issues[0]?.message
}

describe('generateQrTokensSchema', () => {
	// What `validateGenerateQrTokens` used to check in the domain.
	it.each([MIN_GENERATE_COUNT, 10, 250, MAX_GENERATE_COUNT])(
		'accepts a count of %i',
		count => {
			expect(parse({ count }).data?.count).toBe(count)
		},
	)

	it.each([0, -1, MAX_GENERATE_COUNT + 1, 1000])(
		'refuses a count of %i',
		count => {
			expect(parse({ count }).success).toBe(false)
		},
	)

	// The admin form capped the quantity at 1000 and offered a 1000 button, which
	// the API refused. One bound now, and it is this one.
	it('names the API bound, in French, at both ends', () => {
		expect(messageFor({ count: 0 })).toBe(`Minimum ${MIN_GENERATE_COUNT}`)
		expect(messageFor({ count: MAX_GENERATE_COUNT + 1 })).toBe(
			`Maximum ${MAX_GENERATE_COUNT}`,
		)
		expect(MAX_GENERATE_COUNT).toBe(500)
	})

	it('reads the string a form control posts', () => {
		expect(parse({ count: '25' }).data?.count).toBe(25)
	})

	it.each(['dix', '', '1.5', 1.5])('refuses %s, in French', count => {
		expect(messageFor({ count })).toBe('Entrez un nombre entier')
	})

	it('trims an optional batch and caps it at 60 characters', () => {
		expect(parse({ count: 1, batch: '  lot-avril  ' }).data?.batch).toBe(
			'lot-avril',
		)
		expect(parse({ count: 1 }).data?.batch).toBeUndefined()
		expect(messageFor({ count: 1, batch: 'a'.repeat(61) })).toBe(
			'Maximum 60 caractères',
		)
		expect(parse({ count: 1, batch: 'a'.repeat(60) }).success).toBe(true)
	})
})
