import { describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import {
	QrTokenForbiddenError,
	QrTokenNotFoundError,
} from '../../errors/qr-token.errors'
import { requireOwnedQrToken } from '../require-owned-qr-token'

describe('requireOwnedQrToken', () => {
	it('returns the token when the caller owns it', async () => {
		const repository = buildRepository()
		const token = buildQrToken({ userId: 'user-1' })
		vi.mocked(repository.findByCode).mockResolvedValue(token)

		expect(
			await requireOwnedQrToken(repository, 'RCI-ABC123', 'user-1'),
		).toEqual(token)
	})

	it('throws forbidden when somebody else owns it', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ userId: 'user-1' }),
		)

		await expect(
			requireOwnedQrToken(repository, 'RCI-ABC123', 'user-2'),
		).rejects.toThrow(QrTokenForbiddenError)
	})

	/** An unclaimed token has `userId: null`, so nobody owns it yet. */
	it('throws forbidden for an unclaimed token', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findByCode).mockResolvedValue(buildQrToken())

		await expect(
			requireOwnedQrToken(repository, 'RCI-ABC123', 'user-1'),
		).rejects.toThrow(QrTokenForbiddenError)
	})

	it('throws not found when the token does not exist', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(
			requireOwnedQrToken(repository, 'RCI-NOPE', 'user-1'),
		).rejects.toThrow(QrTokenNotFoundError)
	})
})
