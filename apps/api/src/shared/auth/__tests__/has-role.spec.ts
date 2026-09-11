import { describe, expect, it } from 'vitest'
import { hasRole } from '../has-role'

describe('hasRole', () => {
	it('finds the role a user holds', () => {
		expect(hasRole('admin', ['admin'])).toBe(true)
	})

	it('reads a spaced, comma-separated list', () => {
		expect(hasRole('user, admin', ['admin'])).toBe(true)
	})

	it('accepts one role out of several required', () => {
		expect(hasRole('moderator', ['admin', 'moderator'])).toBe(true)
	})

	// A prefix is not a role.
	it.each([null, undefined, '', 'user', 'administrator'])(
		'finds no admin in %j',
		role => {
			expect(hasRole(role, ['admin'])).toBe(false)
		},
	)
})
