import type { ConfigService } from '@nestjs/config'
import type { AuthService } from '@thallesp/nestjs-better-auth'
import { describe, expect, it, vi } from 'vitest'
import type { Auth } from '@/infrastructures/auth/auth.config'
import type { PrismaService } from '@/infrastructures/database/prisma.service'
import { SeederService } from '../seeder.service'

function buildConfig(env: Record<string, string>): ConfigService {
	return {
		get: (key: string, fallback?: string) => env[key] ?? fallback,
	} as unknown as ConfigService
}

function buildPrisma(existingEmails: string[] = []) {
	return {
		user: {
			findUnique: vi.fn(({ where }: { where: { email: string } }) =>
				Promise.resolve(
					existingEmails.includes(where.email) ? { id: 'existing' } : null,
				),
			),
			update: vi.fn().mockResolvedValue({}),
		},
	}
}

function buildAuth() {
	return {
		api: {
			signUpEmail: vi.fn().mockResolvedValue({ user: { id: 'created' } }),
		},
	}
}

function emailsSignedUp(auth: ReturnType<typeof buildAuth>): string[] {
	return auth.api.signUpEmail.mock.calls.map(
		call => (call[0] as { body: { email: string } }).body.email,
	)
}

function build(env: Record<string, string>, existingEmails: string[] = []) {
	const prisma = buildPrisma(existingEmails)
	const auth = buildAuth()
	const service = new SeederService(
		prisma as unknown as PrismaService,
		buildConfig(env),
		auth as unknown as AuthService<Auth>,
	)

	return { service, prisma, auth }
}

const PROD = {
	NODE_ENV: 'production',
	SUPER_ADMIN_EMAIL: 'ops@retrouveci.com',
	SUPER_ADMIN_PASSWORD: 'A-real-Secret-1',
	SYSTEM_ACCOUNT_PASSWORD: 'A-real-Secret-2',
	SYSTEM_ACCOUNT_PHONE: '+2250700000009',
}

describe('SeederService', () => {
	describe('the super admin', () => {
		it('is created with the admin role when absent', async () => {
			const { service, auth, prisma } = build(PROD)

			await service.onApplicationBootstrap()

			expect(auth.api.signUpEmail).toHaveBeenCalledWith({
				body: {
					email: 'ops@retrouveci.com',
					password: 'A-real-Secret-1',
					name: 'Super Admin',
				},
			})
			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: 'created' },
				data: { role: 'admin', emailVerified: true },
			})
		})

		it('is not created twice', async () => {
			const { service, auth } = build(PROD, ['ops@retrouveci.com'])

			await service.onApplicationBootstrap()

			expect(emailsSignedUp(auth)).not.toContain('ops@retrouveci.com')
		})

		/** The point: a failure here is a failed start, not a log line. */
		it('fails the boot when better-auth refuses', async () => {
			const { service, auth } = build(PROD)
			auth.api.signUpEmail.mockRejectedValue(new Error('password too weak'))

			await expect(service.onApplicationBootstrap()).rejects.toThrow(
				'password too weak',
			)
		})

		it.each(['SUPER_ADMIN_EMAIL', 'SUPER_ADMIN_PASSWORD'])(
			'refuses to boot in production without %s',
			async key => {
				const env: Record<string, string> = { ...PROD }
				delete env[key]
				const { service } = build(env)

				await expect(service.onApplicationBootstrap()).rejects.toThrow(
					new RegExp(`${key} is required in production`),
				)
			},
		)

		it('needs no password once the account exists, even in production', async () => {
			const env: Record<string, string> = { ...PROD }
			delete env['SUPER_ADMIN_PASSWORD']
			const { service } = build(env, ['ops@retrouveci.com'])

			await expect(service.onApplicationBootstrap()).resolves.toBeUndefined()
		})

		it('falls back to the repository defaults outside production', async () => {
			const { service, auth } = build({})

			await service.onApplicationBootstrap()

			const signUpEmails = emailsSignedUp(auth)
			expect(signUpEmails).toContain('admin@retrouveci.ci')
		})
	})

	describe('the mock user', () => {
		/** A fixture with a published password has no business in production. */
		it('is not created in production', async () => {
			const { service, auth } = build(PROD)

			await service.onApplicationBootstrap()

			const signUpEmails = emailsSignedUp(auth)
			expect(signUpEmails).toEqual([
				'ops@retrouveci.com',
				'equipe@retrouveci.ci',
			])
			expect(signUpEmails).not.toContain('test@retrouveci.ci')
		})

		it('is created outside production', async () => {
			const { service, auth } = build({})

			await service.onApplicationBootstrap()

			const signUpEmails = emailsSignedUp(auth)
			expect(signUpEmails).toContain('test@retrouveci.ci')
		})

		/** Unlike the super admin, losing it must not stop a developer's API. */
		it('does not fail the boot when it cannot be created', async () => {
			const { service, auth } = build({})
			auth.api.signUpEmail
				.mockResolvedValueOnce({ user: { id: 'created' } })
				.mockRejectedValueOnce(new Error('nope'))

			await expect(service.onApplicationBootstrap()).resolves.toBeUndefined()
		})
	})

	// A listing needs an owner and it cannot be the administrator who filed it:
	// the relation cascades, so their departure would erase everything the team
	// ever published.
	describe('the system account', () => {
		it('is created in production, unlike the mock user', async () => {
			const { service, auth } = build(PROD)

			await service.onApplicationBootstrap()

			expect(emailsSignedUp(auth)).toContain('equipe@retrouveci.ci')
		})

		// The address the service will look it up under, or the account is lost.
		it('is created under the lowercased address', async () => {
			const { service, auth } = build({
				...PROD,
				SYSTEM_ACCOUNT_EMAIL: ' Ops-Team@RetrouveCI.com ',
			})

			await service.onApplicationBootstrap()

			expect(emailsSignedUp(auth)).toContain('ops-team@retrouveci.com')
		})

		it('is not created twice', async () => {
			const { service, auth } = build(PROD, ['equipe@retrouveci.ci'])

			await service.onApplicationBootstrap()

			expect(emailsSignedUp(auth)).not.toContain('equipe@retrouveci.ci')
		})

		it('carries the phone number team listings display', async () => {
			const { service, prisma } = build(PROD)

			await service.onApplicationBootstrap()

			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: 'created' },
				data: {
					phoneNumber: '+2250700000009',
					phoneNumberVerified: true,
					emailVerified: true,
				},
			})
		})

		// The same reason the super admin's password is required: the development
		// fallback is public in this repository, and this account can sign in.
		it('refuses to boot in production without a password', async () => {
			const { service } = build({
				...PROD,
				SYSTEM_ACCOUNT_PASSWORD: '',
			})

			await expect(service.onApplicationBootstrap()).rejects.toThrow(
				'SYSTEM_ACCOUNT_PASSWORD',
			)
		})

		it('needs no password once the account exists, even in production', async () => {
			const { service } = build({ ...PROD, SYSTEM_ACCOUNT_PASSWORD: '' }, [
				'ops@retrouveci.com',
				'equipe@retrouveci.ci',
			])

			await expect(service.onApplicationBootstrap()).resolves.toBeUndefined()
		})
	})
})
