import { vi } from 'vitest'
import type { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken } from '../types/qr-token.types'

export function buildQrToken(overrides: Partial<QrToken> = {}): QrToken {
	return {
		id: 'qr-token-1',
		code: 'RCI-ABC123',
		status: 'generated',
		batch: 'batch-1',
		label: null,
		linkedObject: null,
		userId: null,
		createdAt: new Date('2026-01-01'),
		activatedAt: null,
		revokedAt: null,
		...overrides,
	}
}

/** The repository is a concrete class, so a double is a partial cast. */
export function buildRepository(): QrTokenRepository {
	return {
		createMany: vi.fn(),
		findByCode: vi.fn(),
		findPublicView: vi.fn(),
		activate: vi.fn(),
		revoke: vi.fn(),
		updateDetails: vi.fn(),
		list: vi.fn(),
	} as unknown as QrTokenRepository
}
