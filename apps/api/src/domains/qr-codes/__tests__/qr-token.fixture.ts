import { vi } from 'vitest'
import type { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken, QrTokenOwnerReach } from '../types/qr-token.types'

export function buildQrToken(overrides: Partial<QrToken> = {}): QrToken {
	return {
		id: 'qr-token-1',
		code: 'RCI-ABC123',
		status: 'generated',
		batch: 'batch-1',
		label: null,
		linkedObject: null,
		directContact: false,
		lostItemId: null,
		userId: null,
		createdAt: new Date('2026-01-01'),
		activatedAt: null,
		revokedAt: null,
		lastScannedAt: null,
		...overrides,
	}
}

/** Activated, consented and reachable — each test spoils one of the three. */
export function buildOwnerReach(
	overrides: Partial<QrTokenOwnerReach> = {},
): QrTokenOwnerReach {
	return {
		status: 'activated',
		directContact: true,
		label: 'Mes clés',
		ownerUserId: 'owner-1',
		ownerPhoneNumber: '+2250700000000',
		...overrides,
	}
}

/** The repository is a concrete class, so a double is a partial cast. */
export function buildRepository(): QrTokenRepository {
	return {
		createMany: vi.fn(),
		findByCode: vi.fn(),
		findPublicView: vi.fn(),
		recordScan: vi.fn(),
		listByOwner: vi.fn(),
		findOwnerReach: vi.fn(),
		linkToLostItem: vi.fn(),
		activate: vi.fn(),
		revoke: vi.fn(),
		updateDetails: vi.fn(),
		list: vi.fn(),
		countActivatedByOwner: vi.fn(),
	} as unknown as QrTokenRepository
}
