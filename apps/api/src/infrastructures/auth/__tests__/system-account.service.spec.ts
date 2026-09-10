import type { ConfigService } from '@nestjs/config'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaService } from '@/infrastructures/database/prisma.service'
import {
	SystemAccountMissingError,
	SystemAccountService,
} from '../system-account.service'

function build(
	env: Record<string, string> = {},
	account: { id: string } | null = { id: 'system-1' },
) {
	const prisma = {
		user: { findUnique: vi.fn().mockResolvedValue(account) },
	}
	const config = {
		get: (key: string, fallback?: string) => env[key] ?? fallback,
	} as unknown as ConfigService

	return {
		prisma,
		service: new SystemAccountService(
			prisma as unknown as PrismaService,
			config,
		),
	}
}

describe('SystemAccountService', () => {
	beforeEach(() => vi.clearAllMocks())

	it('resolves the account the seeder created', async () => {
		const { service } = build()

		expect(await service.requireId()).toBe('system-1')
	})

	it('reads the address from the environment, with a development fallback', async () => {
		const { service, prisma } = build({
			SYSTEM_ACCOUNT_EMAIL: 'ops@retrouveci.com',
		})

		await service.requireId()

		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { email: 'ops@retrouveci.com' },
			select: { id: true },
		})
		expect(build().service.email).toBe('equipe@retrouveci.ci')
	})

	// A blank variable is not a configured one: it would send the lookup after
	// an account nobody ever created.
	it('falls back when the variable is set but empty', () => {
		expect(build({ SYSTEM_ACCOUNT_EMAIL: '   ' }).service.email).toBe(
			'equipe@retrouveci.ci',
		)
	})

	// The row is written once and never replaced, so re-reading it on every
	// publication would be a query for nothing.
	it('reads the row once and caches the id', async () => {
		const { service, prisma } = build()

		await service.requireId()
		await service.requireId()

		expect(prisma.user.findUnique).toHaveBeenCalledTimes(1)
	})

	/**
	 * The point: publishing as the team when the team account is missing would
	 * file the listing under whoever is signed in, which is the one thing this
	 * account exists to prevent. It must refuse rather than fall back.
	 */
	it('throws when the account is absent', async () => {
		const { service } = build({}, null)

		await expect(service.requireId()).rejects.toBeInstanceOf(
			SystemAccountMissingError,
		)
	})

	it('does not cache a failed lookup', async () => {
		const { service, prisma } = build({}, null)

		await expect(service.requireId()).rejects.toThrow()
		prisma.user.findUnique.mockResolvedValue({ id: 'seeded-late' })

		expect(await service.requireId()).toBe('seeded-late')
	})
})
