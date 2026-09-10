import {
	ACCOUNT_WRITE_PATHS,
	PROTECTED_ACCOUNT_MESSAGE,
	accountWriteTarget,
	enforcePasswordRule,
	refuseProtectedAccountWrite,
} from '@app/auth'
import { describe, expect, it, vi } from 'vitest'

// `packages/auth` has no runner, so its hook is tested from its consumer — the
// same arrangement the front's shared packages use.

const SYSTEM = 'equipe@retrouveci.ci'

const findUserById = (email: string | null) =>
	vi.fn().mockResolvedValue(email === null ? null : { email })

describe('the account-write routes', () => {
	// A literal, so a route dropped from the list turns this red rather than
	// quietly reopening a way to remove the account.
	it('are exactly the six that act on another account', () => {
		expect([...ACCOUNT_WRITE_PATHS].sort()).toEqual([
			'/admin/ban-user',
			'/admin/impersonate-user',
			'/admin/remove-user',
			'/admin/set-role',
			'/admin/set-user-password',
			'/admin/update-user',
		])
	})

	it.each(ACCOUNT_WRITE_PATHS)('%s names its target by userId', path => {
		expect(accountWriteTarget(path, { userId: 'user-1' })).toBe('user-1')
	})

	it.each(['/admin/list-users', '/admin/create-user', '/sign-in/email'])(
		'%s targets no account',
		path => {
			expect(accountWriteTarget(path, { userId: 'user-1' })).toBeUndefined()
		},
	)

	// better-auth coerces the id, so a number would otherwise walk past.
	it('reads a numeric id as the string better-auth would', () => {
		expect(accountWriteTarget('/admin/remove-user', { userId: 42 })).toBe('42')
	})

	it.each([undefined, {}, { userId: '' }, { userId: null }])(
		'targets nothing when the body names no account (%o)',
		body => {
			expect(accountWriteTarget('/admin/remove-user', body)).toBeUndefined()
		},
	)
})

describe('refuseProtectedAccountWrite', () => {
	it.each(ACCOUNT_WRITE_PATHS)(
		'refuses %s on the system account',
		async path => {
			await expect(
				refuseProtectedAccountWrite(
					path,
					{ userId: 'system-1' },
					[SYSTEM],
					findUserById(SYSTEM),
				),
			).rejects.toThrow(PROTECTED_ACCOUNT_MESSAGE)
		},
	)

	it('lets the same write through on any other account', async () => {
		await expect(
			refuseProtectedAccountWrite(
				'/admin/remove-user',
				{ userId: 'user-1' },
				[SYSTEM],
				findUserById('someone@retrouveci.ci'),
			),
		).resolves.toBeUndefined()
	})

	it('compares without regard to case', async () => {
		await expect(
			refuseProtectedAccountWrite(
				'/admin/ban-user',
				{ userId: 'system-1' },
				[SYSTEM],
				findUserById('Equipe@RetrouveCI.ci'),
			),
		).rejects.toThrow(PROTECTED_ACCOUNT_MESSAGE)
	})

	// An unknown id is better-auth's own 404 to answer, not this hook's.
	it('lets an unknown id through to better-auth', async () => {
		await expect(
			refuseProtectedAccountWrite(
				'/admin/remove-user',
				{ userId: 'ghost' },
				[SYSTEM],
				findUserById(null),
			),
		).resolves.toBeUndefined()
	})

	it('reads nothing on a route that targets no account', async () => {
		const lookup = findUserById(SYSTEM)

		await refuseProtectedAccountWrite('/admin/list-users', {}, [SYSTEM], lookup)

		expect(lookup).not.toHaveBeenCalled()
	})

	it('reads nothing when no account is protected', async () => {
		const lookup = findUserById(SYSTEM)

		await refuseProtectedAccountWrite(
			'/admin/remove-user',
			{ userId: 'system-1' },
			[],
			lookup,
		)

		expect(lookup).not.toHaveBeenCalled()
	})
})

// It had no test at all before being made a plain function.
describe('enforcePasswordRule', () => {
	it('refuses a password below the rule on /admin/create-user', () => {
		expect(() =>
			enforcePasswordRule('/admin/create-user', { password: 'short' }),
		).toThrow()
	})

	it('accepts a password that meets the rule', () => {
		expect(() =>
			enforcePasswordRule('/admin/create-user', { password: 'Valid-Pass-1' }),
		).not.toThrow()
	})

	it('leaves every other route alone', () => {
		expect(() =>
			enforcePasswordRule('/sign-up/email', { password: 'x' }),
		).not.toThrow()
	})
})
