import { describe, expect, it } from 'vitest'
import { ASSIGNABLE_PHONE_ERROR_MESSAGE } from '../../shared/phone'
import { contactWhatsappSchema } from '../create.schema'

const parse = (input: string) => contactWhatsappSchema.safeParse(input)

describe('contactWhatsappSchema', () => {
	it.each([
		['a bare local number', '0700000000'],
		['a spaced local number', '07 00 00 00 00'],
		['a number already carrying the country code', '2250700000000'],
		['the E.164 form', '+2250700000000'],
		['the E.164 form, spaced', '+225 07 00 00 00 00'],
	])('normalises %s to a single E.164 number', (_label, input) => {
		expect(parse(input).data).toBe('+2250700000000')
	})

	// The drift this replaces: the API only checked a length of 8 to 20, and the
	// client prefixed `+225` unconditionally, so `2250700000000` was stored as
	// `+2252250700000000` and its owner could not be reached.
	it('never doubles the country code', () => {
		expect(parse('2250700000000').data).not.toContain('225225')
	})

	it.each([
		['too short', '070000000'],
		['too long', '07000000000'],
		['empty', ''],
		['letters', 'zero-seven'],
		['a prefix no operator assigns', '0600000000'],
	])('refuses %s, in French', (_label, input) => {
		expect(parse(input).error?.issues[0]?.message).toBe(
			ASSIGNABLE_PHONE_ERROR_MESSAGE,
		)
	})
})
