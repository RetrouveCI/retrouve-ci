import { describe, expect, it } from 'vitest'
import { formatPhoneForDisplay } from '../format-phone'

describe('formatPhoneForDisplay', () => {
	it('groups a stored E.164 number in pairs', () => {
		expect(formatPhoneForDisplay('+2250700000000')).toBe('+225 07 00 00 00 00')
	})

	it('accepts a number already written locally', () => {
		expect(formatPhoneForDisplay('0700000000')).toBe('+225 07 00 00 00 00')
	})

	it('accepts a spaced number', () => {
		expect(formatPhoneForDisplay('07 00 00 00 00')).toBe('+225 07 00 00 00 00')
	})

	it('leaves a number the rule does not recognise exactly as stored', () => {
		expect(formatPhoneForDisplay('+33612345678')).toBe('+33612345678')
	})

	it('answers nothing when there is no number', () => {
		expect(formatPhoneForDisplay(null)).toBeNull()
	})
})
