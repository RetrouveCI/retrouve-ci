import { describe, expect, it } from 'vitest'
import {
	isAssignableLocalNumber,
	isValidLocalNumber,
	stripPhoneSpacing,
	toE164,
	toLocalDigits,
	toWhatsAppUrl,
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

	// The guard. `isValidLocalNumber` is the sign-in predicate: an account whose
	// stored number predates `isAssignableLocalNumber` must keep signing in, so
	// tightening this one is a regression, not a fix.
	it.each(['0600000000', '0000000000', '1234567890'])(
		'stays lax on %s, which sign-in must keep accepting',
		input => {
			expect(isValidLocalNumber(input)).toBe(true)
		},
	)
})

describe('isAssignableLocalNumber', () => {
	it.each([
		'0100000000',
		'0500000000',
		'0700000000',
		'07 00 00 00 00',
		'+2250700000000',
		'225 01 00 00 00 00',
	])('accepts %s', input => {
		expect(isAssignableLocalNumber(input)).toBe(true)
	})

	// The prefixes no operator assigns, then the two lengths that are not ten.
	it.each([
		'0000000000',
		'0200000000',
		'0300000000',
		'0400000000',
		'0600000000',
		'0800000000',
		'0900000000',
		'1234567890',
		'070000000',
		'07000000000',
		'',
		'pas un numéro',
	])('refuses %s', input => {
		expect(isAssignableLocalNumber(input)).toBe(false)
	})
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

describe('toWhatsAppUrl', () => {
	it('addresses the recipient without a plus sign', () => {
		expect(toWhatsAppUrl('0700000000')).toBe('https://wa.me/2250700000000')
	})

	// A stored number may be E.164, spaced, or bare local.
	it.each(['+2250700000000', '07 00 00 00 00', '+225 07 00 00 00 00'])(
		'reads %s as the same recipient',
		stored => {
			expect(toWhatsAppUrl(stored)).toBe('https://wa.me/2250700000000')
		},
	)

	it('encodes a prefilled message rather than breaking the URL', () => {
		expect(toWhatsAppUrl('0700000000', "J'ai trouvé ça")).toBe(
			"https://wa.me/2250700000000?text=J'ai%20trouv%C3%A9%20%C3%A7a",
		)
	})

	it('appends nothing when there is no message', () => {
		expect(toWhatsAppUrl('0700000000', '')).toBe('https://wa.me/2250700000000')
	})

	// A link on ten wrong digits reads as the app being broken.
	it.each(['', '070000000', '07000000000', 'abcdefghij'])(
		'answers null for %o',
		stored => {
			expect(toWhatsAppUrl(stored)).toBeNull()
		},
	)
})
