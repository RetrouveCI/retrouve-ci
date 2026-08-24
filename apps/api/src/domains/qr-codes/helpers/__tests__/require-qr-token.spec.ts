import { describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import { QrTokenNotFoundError } from '../../errors/qr-token.errors'
import { requireQrToken } from '../require-qr-token'

describe('requireQrToken', () => {
	it('returns the token when it exists', async () => {
		const repository = buildRepository()
		const token = buildQrToken()
		vi.mocked(repository.findByCode).mockResolvedValue(token)

		expect(await requireQrToken(repository, 'RCI-ABC123')).toEqual(token)
	})

	it('throws when it does not', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(requireQrToken(repository, 'RCI-NOPE')).rejects.toThrow(
			QrTokenNotFoundError,
		)
	})

	it.each(['generated', 'activated', 'revoked'] as const)(
		'does not narrow by status (%s)',
		async status => {
			const repository = buildRepository()
			vi.mocked(repository.findByCode).mockResolvedValue(
				buildQrToken({ status }),
			)

			expect((await requireQrToken(repository, 'RCI-ABC123')).status).toBe(
				status,
			)
		},
	)
})
