import { hasRole, refuseSignInWithoutRole, roleOf } from '@app/auth'
import { describe, expect, it, vi } from 'vitest'

// `packages/auth` has no runner, so its hook is tested from its consumer — the
// same arrangement `protected-accounts.spec.ts` uses.

const ADMIN = ['admin'] as const

/** What the backoffice's instance is built with. */
function gate({
	role = null,
	path = '/sign-in/email',
	body = { email: 'someone@retrouveci.com', password: 'Secret123' },
	requiredRoles = ADMIN,
}: {
	role?: string | null
	path?: string
	body?: unknown
	requiredRoles?: readonly string[]
} = {}) {
	const findRoleByEmail = vi.fn().mockResolvedValue(role)
	const hashPassword = vi.fn().mockResolvedValue('hashed')

	return {
		findRoleByEmail,
		hashPassword,
		run: () =>
			refuseSignInWithoutRole(
				path,
				body,
				requiredRoles,
				findRoleByEmail,
				hashPassword,
			),
	}
}

describe('refuseSignInWithoutRole', () => {
	it('lets an administrator through', async () => {
		const { run, hashPassword } = gate({ role: 'admin' })

		await expect(run()).resolves.toBeUndefined()
		expect(hashPassword).not.toHaveBeenCalled()
	})

	// The hole this closes: every visitor holds a password account, minted under
	// `<number>@phone.retrouveci.local` by a phone sign-up.
	it('refuses an ordinary visitor’s account', async () => {
		const { run } = gate({ role: 'user' })

		await expect(run()).rejects.toMatchObject({
			status: 'UNAUTHORIZED',
			body: { code: 'INVALID_EMAIL_OR_PASSWORD' },
		})
	})

	it('refuses an account holding no role at all', async () => {
		const { run } = gate({ role: null })

		await expect(run()).rejects.toMatchObject({ status: 'UNAUTHORIZED' })
	})

	/**
	 * Word for word better-auth's own answer. A refusal that read differently
	 * would tell an anonymous caller which addresses hold an account.
	 */
	it('answers exactly what a wrong password answers', async () => {
		const { run } = gate({ role: 'user' })

		await expect(run()).rejects.toMatchObject({
			body: {
				message: 'Invalid email or password',
				code: 'INVALID_EMAIL_OR_PASSWORD',
			},
		})
	})

	// And it must cost the same, or the timing says it on the message's behalf.
	it('hashes the password before refusing, as better-auth does', async () => {
		const { run, hashPassword } = gate({ role: 'user' })

		await expect(run()).rejects.toThrow()
		expect(hashPassword).toHaveBeenCalledWith('Secret123')
	})

	it('leaves every other path alone', async () => {
		const { run, findRoleByEmail } = gate({
			role: 'user',
			path: '/sign-up/email',
		})

		await expect(run()).resolves.toBeUndefined()
		expect(findRoleByEmail).not.toHaveBeenCalled()
	})

	// The public instance names no role, and must stay open to everyone.
	it('opens the door when no role is required', async () => {
		const { run, findRoleByEmail } = gate({ role: 'user', requiredRoles: [] })

		await expect(run()).resolves.toBeUndefined()
		expect(findRoleByEmail).not.toHaveBeenCalled()
	})

	it.each([{}, { email: 42 }, { email: '' }, null])(
		'leaves a body better-auth will refuse itself: %j',
		async body => {
			const { run, findRoleByEmail } = gate({ body })

			await expect(run()).resolves.toBeUndefined()
			expect(findRoleByEmail).not.toHaveBeenCalled()
		},
	)
})

describe('roleOf', () => {
	// Measured against a real row: the `admin()` plugin's column is on what the
	// adapter returns, though better-auth's static `User` does not carry it.
	it('reads the role off a user row', () => {
		expect(roleOf({ id: 'user-1', email: 'a@b.c', role: 'admin' })).toBe(
			'admin',
		)
	})

	it.each([null, undefined, {}, { role: null }, { role: 7 }])(
		'finds no role in %j',
		user => {
			expect(roleOf(user)).toBeNull()
		},
	)

	// The two halves meet: what `roleOf` reads is what `hasRole` decides on.
	it('feeds hasRole a comma-separated list unchanged', () => {
		expect(hasRole(roleOf({ role: 'user,admin' }), ['admin'])).toBe(true)
	})
})
