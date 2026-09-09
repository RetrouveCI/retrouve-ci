import { recoveryUrl } from '../recovery-url'

const RESET = '/reset-password'

describe('recoveryUrl', () => {
	it('carries the number alone when the destination is the default', () => {
		expect(recoveryUrl(RESET, '0700000000', null)).toBe(
			`${RESET}?phone=0700000000`,
		)
	})

	// Invariant 2 of flow E: whoever came from "Publier" still goes back to
	// "Publier" after resetting their password.
	it('carries both the number and the destination', () => {
		expect(recoveryUrl(RESET, '0700000000', '/publish')).toBe(
			`${RESET}?redirectTo=%2Fpublish&phone=0700000000`,
		)
	})

	it('drops the number when there is none', () => {
		expect(recoveryUrl(RESET, '', '/publish')).toBe(
			`${RESET}?redirectTo=%2Fpublish`,
		)
		expect(recoveryUrl(RESET, '', null)).toBe(RESET)
	})

	// `withRedirect` sanitises, and an auth path would loop the visitor back here.
	it.each(['https://evil.test', '//evil.test', '/login'])(
		'refuses %p as a destination',
		destination => {
			expect(recoveryUrl(RESET, '0700000000', destination)).toBe(
				`${RESET}?phone=0700000000`,
			)
		},
	)
})
