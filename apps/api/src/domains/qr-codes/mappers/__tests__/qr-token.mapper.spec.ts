import {
	ModerationStatus as PrismaModerationStatus,
	QrTokenStatus as PrismaQrTokenStatus,
	ResolutionStatus as PrismaResolutionStatus,
} from '@app/database'
import { describe, expect, it } from 'vitest'
import {
	toDomainQrToken,
	toDomainStatus,
	toLinkedLostItem,
	toPrismaStatus,
} from '../qr-token.mapper'

describe('qr-token mapper', () => {
	it('maps a Prisma QrToken to the domain model', () => {
		const prismaQrToken = {
			id: 'qr-token-1',
			code: 'RCI-ABC123',
			status: PrismaQrTokenStatus.ACTIVATED,
			batch: 'batch-1',
			label: 'Mes clés',
			linkedObject: 'lost-item-1',
			directContact: true,
			lostItemId: 'lost-item-1',
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			activatedAt: new Date('2026-01-02'),
			revokedAt: null,
			lastScannedAt: new Date('2026-01-03'),
		}

		expect(toDomainQrToken(prismaQrToken)).toEqual({
			id: 'qr-token-1',
			code: 'RCI-ABC123',
			status: 'activated',
			batch: 'batch-1',
			label: 'Mes clés',
			linkedObject: 'lost-item-1',
			directContact: true,
			lostItemId: 'lost-item-1',
			userId: 'user-1',
			createdAt: new Date('2026-01-01'),
			activatedAt: new Date('2026-01-02'),
			revokedAt: null,
			lastScannedAt: new Date('2026-01-03'),
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

/** A9's leak guard: a finder must never be shown an unmoderated listing. */
describe('toLinkedLostItem', () => {
	const row = (
		moderationStatus: PrismaModerationStatus,
		resolutionStatus: PrismaResolutionStatus,
	) => ({
		id: 'lost-item-1',
		title: 'Trousseau de clés',
		ville: 'Abidjan',
		photos: ['https://cdn/first.jpg', 'https://cdn/second.jpg'],
		moderationStatus,
		resolutionStatus,
	})

	it('shows a published, still active listing, and its first photo alone', () => {
		expect(
			toLinkedLostItem(
				row(PrismaModerationStatus.PUBLISHED, PrismaResolutionStatus.ACTIVE),
			),
		).toEqual({
			id: 'lost-item-1',
			title: 'Trousseau de clés',
			ville: 'Abidjan',
			photo: 'https://cdn/first.jpg',
		})
	})

	it('answers null when nothing is linked', () => {
		expect(toLinkedLostItem(null)).toBeNull()
	})

	it('carries no photo rather than an empty one', () => {
		const bare = {
			...row(PrismaModerationStatus.PUBLISHED, PrismaResolutionStatus.ACTIVE),
			photos: [],
		}

		expect(toLinkedLostItem(bare)?.photo).toBeNull()
	})

	// Every combination that is not « published and active » must answer null.
	it.each(
		Object.values(PrismaModerationStatus).flatMap(moderation =>
			Object.values(PrismaResolutionStatus).map(
				resolution => [moderation, resolution] as const,
			),
		),
	)(
		'hides a %s / %s listing unless both are right',
		(moderation, resolution) => {
			const showable =
				moderation === PrismaModerationStatus.PUBLISHED &&
				resolution === PrismaResolutionStatus.ACTIVE

			expect(toLinkedLostItem(row(moderation, resolution)) === null).toBe(
				!showable,
			)
		},
	)
})
