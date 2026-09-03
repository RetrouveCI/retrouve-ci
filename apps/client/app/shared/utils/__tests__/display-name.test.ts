import { isPhoneLikeName, toContactName } from '../display-name'

describe('isPhoneLikeName', () => {
	// What `getTempName` stores, and the shapes it could be typed back as.
	it.each([
		'+2250700000000',
		'0700000000',
		'+225 07 00 00 00 00',
		'225-0700000000',
	])('reads %p as the number it is', name => {
		expect(isPhoneLikeName(name)).toBe(true)
	})

	it.each(['Konan', 'Awa Traoré', 'Jean-Paul', '', '   '])(
		'leaves %p alone',
		name => {
			expect(isPhoneLikeName(name)).toBe(false)
		},
	)

	it('does not flag a name that merely contains a number', () => {
		expect(isPhoneLikeName('Konan 0700000000')).toBe(false)
	})

	it('does not flag digits that are too few to be a number', () => {
		expect(isPhoneLikeName('07')).toBe(false)
	})
})

describe('toContactName', () => {
	it('keeps a real name, trimmed', () => {
		expect(toContactName('  Konan  ')).toBe('Konan')
	})

	it('drops a number rather than prefilling a form with it', () => {
		expect(toContactName('+2250700000000')).toBe('')
	})
})
