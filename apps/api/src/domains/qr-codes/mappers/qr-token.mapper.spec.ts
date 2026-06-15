import { QrTokenStatus as PrismaQrTokenStatus } from '@retrouve-ci/database'
import { describe, expect, it } from 'vitest'
import {
	toDomainQrToken,
	toDomainStatus,
	toPrismaStatus,
} from './qr-token.mapper'

describe('qr-token mapper', () => {
	it('maps a Prisma QrToken to the domain model', () => {
		const prismaQrToken = {
			id: 'qr-token-1',
			code: 'RCI-ABC123',
			status: PrismaQrTokenStatus.ACTIVATED,
			batch: 'batch-1',
			label: 'Mes clés',
			linkedObject: 'lost-item-1',
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			activatedAt: new Date('2026-01-02'),
			revokedAt: null,
		}

		expect(toDomainQrToken(prismaQrToken)).toEqual({
			id: 'qr-token-1',
			code: 'RCI-ABC123',
			status: 'activated',
			batch: 'batch-1',
			label: 'Mes clés',
			linkedObject: 'lost-item-1',
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			activatedAt: new Date('2026-01-02'),
			revokedAt: null,
		})
	})

	it.each([
		['generated', PrismaQrTokenStatus.GENERATED],
		['activated', PrismaQrTokenStatus.ACTIVATED],
		['revoked', PrismaQrTokenStatus.REVOKED],
	] as const)('maps status %s both ways', (domain, prisma) => {
		expect(toPrismaStatus(domain)).toBe(prisma)
		expect(toDomainStatus(prisma)).toBe(domain)
	})
})
