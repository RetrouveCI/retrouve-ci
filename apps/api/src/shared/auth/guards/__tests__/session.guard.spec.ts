import { ForbiddenException, UnauthorizedException } from '@nestjs/common'
import type { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminAuth, Auth } from '@/infrastructures/auth/auth.config'
import { SessionGuard } from '../session.guard'

const ADMIN_ORIGIN = 'http://localhost:3001'
const PUBLIC_ORIGIN = 'http://localhost:3000'

interface RequestDouble {
	headers: Record<string, string | undefined>
	session?: unknown
	user?: unknown
}

function contextFor(
	request: RequestDouble,
	metadata: Record<string, unknown> = {},
): ExecutionContext {
	return {
		getType: () => 'http',
		getHandler: () => () => undefined,
		getClass: () => class {},
		switchToHttp: () => ({ getRequest: () => request }),
		__metadata: metadata,
	} as unknown as ExecutionContext
}

function reflectorFor(metadata: Record<string, unknown>): Reflector {
	return {
		getAllAndOverride: (key: string) => metadata[key],
	} as unknown as Reflector
}

function authFor(role?: string) {
	const getSession = vi.fn().mockResolvedValue(role ? { user: { role } } : null)
	return { auth: { api: { getSession } } as unknown as Auth, getSession }
}

function build({
	clientRole,
	adminRole,
	metadata = {},
}: {
	clientRole?: string
	adminRole?: string
	metadata?: Record<string, unknown>
}) {
	const client = authFor(clientRole)
	const admin = authFor(adminRole)
	const guard = new SessionGuard(
		reflectorFor(metadata),
		client.auth,
		admin.auth as unknown as AdminAuth,
	)
	return { guard, client, admin }
}

describe('SessionGuard', () => {
	beforeEach(() => {
		vi.stubEnv('ADMIN_ORIGINS', ADMIN_ORIGIN)
	})

	afterEach(() => {
		vi.unstubAllEnvs()
	})

	describe('picks the instance the origin points at', () => {
		it('reads the backoffice session from the backoffice origin', async () => {
			const { guard, client, admin } = build({
				adminRole: 'admin',
				metadata: { ROLES: ['admin'] },
			})

			await expect(
				guard.canActivate(contextFor({ headers: { origin: ADMIN_ORIGIN } })),
			).resolves.toBe(true)
			expect(admin.getSession).toHaveBeenCalledOnce()
			expect(client.getSession).not.toHaveBeenCalled()
		})

		it('reads the public session from the public origin', async () => {
			const { guard, client, admin } = build({ clientRole: 'user' })

			await expect(
				guard.canActivate(contextFor({ headers: { origin: PUBLIC_ORIGIN } })),
			).resolves.toBe(true)
			expect(client.getSession).toHaveBeenCalledOnce()
			expect(admin.getSession).not.toHaveBeenCalled()
		})

		it('refuses an admin-only endpoint from the public origin, even though the admin cookie is in the request', async () => {
			const { guard, admin } = build({
				clientRole: 'user',
				adminRole: 'admin',
				metadata: { ROLES: ['admin'] },
			})

			await expect(
				guard.canActivate(contextFor({ headers: { origin: PUBLIC_ORIGIN } })),
			).rejects.toThrow(ForbiddenException)
			expect(admin.getSession).not.toHaveBeenCalled()
		})

		it('uses the audience header when there is no origin', async () => {
			const { guard, admin, client } = build({ adminRole: 'admin' })

			await expect(
				guard.canActivate(
					contextFor({ headers: { 'x-auth-audience': 'admin' } }),
				),
			).resolves.toBe(true)
			expect(admin.getSession).toHaveBeenCalledOnce()
			expect(client.getSession).not.toHaveBeenCalled()
		})

		it('ignores the audience header when an origin is present', async () => {
			const { guard, client, admin } = build({ clientRole: 'user' })

			await guard.canActivate(
				contextFor({
					headers: { origin: PUBLIC_ORIGIN, 'x-auth-audience': 'admin' },
				}),
			)

			expect(client.getSession).toHaveBeenCalledOnce()
			expect(admin.getSession).not.toHaveBeenCalled()
		})
	})

	describe('enforces the route metadata', () => {
		it('lets an anonymous request through on a public route', async () => {
			const { guard } = build({ metadata: { PUBLIC: true } })

			await expect(
				guard.canActivate(contextFor({ headers: { origin: PUBLIC_ORIGIN } })),
			).resolves.toBe(true)
		})

		it('rejects an anonymous request on a protected route', async () => {
			const { guard } = build({})

			await expect(
				guard.canActivate(contextFor({ headers: { origin: PUBLIC_ORIGIN } })),
			).rejects.toThrow(UnauthorizedException)
		})

		it('lets an anonymous request through when auth is optional', async () => {
			const { guard } = build({ metadata: { OPTIONAL: true } })

			await expect(
				guard.canActivate(contextFor({ headers: { origin: PUBLIC_ORIGIN } })),
			).resolves.toBe(true)
		})

		it('rejects a role the route does not allow', async () => {
			const { guard } = build({
				clientRole: 'user',
				metadata: { ROLES: ['admin'] },
			})

			await expect(
				guard.canActivate(contextFor({ headers: { origin: PUBLIC_ORIGIN } })),
			).rejects.toThrow(ForbiddenException)
		})

		it('accepts one role out of several the user holds', async () => {
			const { guard } = build({
				adminRole: 'admin,moderator',
				metadata: { ROLES: ['moderator'] },
			})

			await expect(
				guard.canActivate(contextFor({ headers: { origin: ADMIN_ORIGIN } })),
			).resolves.toBe(true)
		})
	})

	it('attaches the session and the user to the request', async () => {
		const { guard } = build({ clientRole: 'user' })
		const request: RequestDouble = { headers: { origin: PUBLIC_ORIGIN } }

		await guard.canActivate(contextFor(request))

		expect(request.session).toEqual({ user: { role: 'user' } })
		expect(request.user).toEqual({ role: 'user' })
	})

	it('does not apply outside HTTP', async () => {
		const { guard, client } = build({ clientRole: 'user' })

		await expect(
			guard.canActivate({ getType: () => 'ws' } as unknown as ExecutionContext),
		).resolves.toBe(true)
		expect(client.getSession).not.toHaveBeenCalled()
	})
})
