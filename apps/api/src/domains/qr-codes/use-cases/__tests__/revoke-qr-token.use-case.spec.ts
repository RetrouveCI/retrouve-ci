import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import {
	QrTokenForbiddenError,
	QrTokenNotFoundError,
} from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { RevokeQrTokenUseCase } from '../revoke-qr-token.use-case'

describe('RevokeQrTokenUseCase', () => {
	let repository: QrTokenRepository
	let useCase: RevokeQrTokenUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new RevokeQrTokenUseCase(repository)
	})

	it('revokes a token the caller owns', async () => {
		const revoked = buildQrToken({ status: 'revoked', userId: 'user-1' })
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'user-1' }),
		)
		vi.mocked(repository.revoke).mockResolvedValue(revoked)

		const result = await useCase.execute({
			code: 'RCI-ABC123',
			userId: 'user-1',
		})

		expect(repository.revoke).toHaveBeenCalledWith('RCI-ABC123')
		expect(result).toEqual(revoked)
	})

	it("refuses somebody else's token without writing", async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'user-1' }),
		)

		await expect(
			useCase.execute({ code: 'RCI-ABC123', userId: 'user-2' }),
		).rejects.toThrow(QrTokenForbiddenError)
		expect(repository.revoke).not.toHaveBeenCalled()
	})

	it('throws when the token does not exist', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(
			useCase.execute({ code: 'RCI-NOPE', userId: 'user-1' }),
		).rejects.toThrow(QrTokenNotFoundError)
	})
})
