import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import { QrTokenNotFoundError } from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GetQrTokenByCodeUseCase } from '../get-qr-token-by-code.use-case'

describe('GetQrTokenByCodeUseCase', () => {
	let repository: QrTokenRepository
	let useCase: GetQrTokenByCodeUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetQrTokenByCodeUseCase(repository)
	})

	it('returns the token when it exists', async () => {
		const token = buildQrToken()
		vi.mocked(repository.findByCode).mockResolvedValue(token)

		expect(await useCase.execute('RCI-ABC123')).toEqual(token)
	})

	it('throws when it does not', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(useCase.execute('RCI-NOPE')).rejects.toThrow(
			QrTokenNotFoundError,
		)
	})

	/**
	 * Current behaviour: `GET /qr-codes/:code` is `@AllowAnonymous()`, so this
	 * returns the owner's `userId` and label to anyone holding a code.
	 * `GetQrTokenPublicViewUseCase` is the one that narrows to what a scan shows.
	 */
	it('returns the owner id of an activated token', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'user-1' }),
		)

		expect((await useCase.execute('RCI-ABC123')).userId).toBe('user-1')
	})
})
