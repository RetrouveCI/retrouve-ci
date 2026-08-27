import { isValidLocalNumber, toE164, toLocalDigits } from '../phone'

describe('toLocalDigits', () => {
	it.each([
		['the local number', '0585743342'],
		['the local number spaced', '05 85 74 33 42'],
		['E.164', '+2250585743342'],
		['E.164 spaced', '+225 05 85 74 33 42'],
		['no plus', '2250585743342'],
	])('reduces %s to the 10 local digits', (_label, input) => {
		expect(toLocalDigits(input)).toBe('0585743342')
	})
})

describe('isValidLocalNumber', () => {
	it.each(['0585743342', '05 85 74 33 42', '+2250585743342'])(
		'accepts %s',
		input => {
			expect(isValidLocalNumber(input)).toBe(true)
		},
	)

	it.each([
		['too short', '058574334'],
		['too long', '05857433421'],
		['empty', ''],
		['letters', 'pas un numero'],
		['a country code alone', '+225'],
	])('rejects %s', (_label, input) => {
		expect(isValidLocalNumber(input)).toBe(false)
	})
})

describe('toE164', () => {
	// The same number, however the user typed it, must reach better-auth in one
	// shape — otherwise the stored number and the one being verified differ.
	it.each(['0585743342', '05 85 74 33 42', '+2250585743342', '2250585743342'])(
		'normalises %s to a single stored form',
		input => {
			expect(toE164(input)).toBe('+2250585743342')
		},
	)
})
