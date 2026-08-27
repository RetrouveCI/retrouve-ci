import { describe, expect, it } from 'vitest'
import {
	isValidLocalNumber,
	stripPhoneSpacing,
	toE164,
	toLocalDigits,
} from '../phone'

describe('toLocalDigits', () => {
	// The four shapes a form, better-auth and the SMS gateway each hand over.
	it.each([
		['0700000000', '0700000000'],
		['07 00 00 00 00', '0700000000'],
		['+2250700000000', '0700000000'],
		['225 07 00 00 00 00', '0700000000'],
	])('reads %s as %s', (input, expected) => {
		expect(toLocalDigits(input)).toBe(expected)
	})
})

describe('isValidLocalNumber', () => {
	it.each(['0700000000', '07 00 00 00 00', '+2250700000000'])(
		'accepts %s',
		input => {
			expect(isValidLocalNumber(input)).toBe(true)
		},
	)

	it.each(['', '070000000', '070000000012', 'pas un numéro'])(
		'refuses %s',
		input => {
			expect(isValidLocalNumber(input)).toBe(false)
		},
	)
})

describe('stripPhoneSpacing', () => {
	it('keeps the digits and nothing else', () => {
		expect(stripPhoneSpacing('+225 07-00.00 00 00')).toBe('2250700000000')
	})
})

describe('toE164', () => {
	it('prefixes the country code once, whatever the input carries', () => {
		expect(toE164('0700000000')).toBe('+2250700000000')
		expect(toE164('+225 07 00 00 00 00')).toBe('+2250700000000')
	})
})
