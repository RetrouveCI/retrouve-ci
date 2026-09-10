import { describe, expect, it } from 'vitest'
import {
	DEFAULT_SYSTEM_ACCOUNT_EMAIL,
	resolveSystemAccountEmail,
} from '../system-account.email'

describe('resolveSystemAccountEmail', () => {
	it('uses the configured address', () => {
		expect(resolveSystemAccountEmail('ops@retrouveci.com')).toBe(
			'ops@retrouveci.com',
		)
	})

	it.each([undefined, '', '   '])('falls back when the variable is %o', raw => {
		expect(resolveSystemAccountEmail(raw)).toBe(DEFAULT_SYSTEM_ACCOUNT_EMAIL)
	})

	// better-auth stores it lowercased, so the three readers must agree on that.
	it('trims and lowercases, as better-auth stores it', () => {
		expect(resolveSystemAccountEmail('  Equipe@RetrouveCI.ci ')).toBe(
			'equipe@retrouveci.ci',
		)
	})
})
