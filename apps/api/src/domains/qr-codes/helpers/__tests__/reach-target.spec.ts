import { describe, expect, it } from 'vitest'
import { toReachTarget } from '../reach-target'

describe('toReachTarget', () => {
	it('dials the stored line in E.164', () => {
		expect(toReachTarget('+2250700000000', 'call')).toBe('tel:+2250700000000')
	})

	it('addresses wa.me without the plus sign', () => {
		expect(toReachTarget('+2250700000000', 'whatsapp')).toBe(
			'https://wa.me/2250700000000',
		)
	})

	// The gateway's own rule: a bare local number, a spaced one and the E.164
	// form all name the same line.
	it.each(['0700000000', '07 00 00 00 00', '+225 07 00 00 00 00'])(
		'reads %s as the same number',
		stored => {
			expect(toReachTarget(stored, 'call')).toBe('tel:+2250700000000')
		},
	)

	it('encodes a prefilled message rather than breaking the URL', () => {
		const target = toReachTarget('+2250700000000', 'whatsapp', "J'ai trouvé ça")

		expect(target).toBe(
			"https://wa.me/2250700000000?text=J'ai%20trouv%C3%A9%20%C3%A7a",
		)
	})

	it('prefills nothing on a call, which carries no message', () => {
		expect(toReachTarget('+2250700000000', 'call', 'Bonjour')).toBe(
			'tel:+2250700000000',
		)
	})

	// Point 4 of the step: an absent number is not an error.
	it.each([null, '', '070000000', '07000000000'])(
		'answers null for %o rather than a dead button',
		stored => {
			expect(toReachTarget(stored, 'call')).toBeNull()
		},
	)
})
