import { isValidLocalNumber } from '../phone'

describe('isValidLocalNumber', () => {
	it.each([
		['the local number', '0585743342'],
		['spaced', '05 85 74 33 42'],
		['E.164', '+2250585743342'],
		['no plus', '2250585743342'],
	])('accepts %s', (_label, input) => {
		expect(isValidLocalNumber(input)).toBe(true)
	})

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
