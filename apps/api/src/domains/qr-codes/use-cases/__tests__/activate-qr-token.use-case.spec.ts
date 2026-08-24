import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import {
	QrTokenAlreadyActivatedError,
	QrTokenNotFoundError,
	QrTokenRevokedError,
} from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { ActivateQrTokenUseCase } from '../activate-qr-token.use-case'

describe('ActivateQrTokenUseCase', () => {
	let repository: QrTokenRepository
	let useCase: ActivateQrTokenUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new ActivateQrTokenUseCase(repository)
	})

	it('activates a generated token', async () => {
		const activated = buildQrToken({ status: 'activated', userId: 'user-1' })
		vi.mocked(repository.findByCode).mockResolvedValue(buildQrToken())
		vi.mocked(repository.activate).mockResolvedValue(activated)

		const result = await useCase.execute({
			code: 'RCI-ABC123',
			userId: 'user-1',
			data: { label: 'Mes clés' },
		})

		expect(repository.activate).toHaveBeenCalledWith('RCI-ABC123', 'user-1', {
			label: 'Mes clés',
		})
		expect(result).toEqual(activated)
	})

	/** Activation claims ownership, so an unclaimed token is not refused. */
	it('activates a token nobody owns yet', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ userId: null }),
		)
		vi.mocked(repository.activate).mockResolvedValue(buildQrToken())

		await expect(
			useCase.execute({ code: 'RCI-ABC123', userId: 'user-9', data: {} }),
		).resolves.toBeDefined()
	})

	it('throws when already activated, without writing', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated' }),
		)

		await expect(
			useCase.execute({ code: 'RCI-ABC123', userId: 'user-1', data: {} }),
		).rejects.toThrow(QrTokenAlreadyActivatedError)
		expect(repository.activate).not.toHaveBeenCalled()
	})

	it('throws when revoked, without writing', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'revoked' }),
		)

		await expect(
			useCase.execute({ code: 'RCI-ABC123', userId: 'user-1', data: {} }),
		).rejects.toThrow(QrTokenRevokedError)
		expect(repository.activate).not.toHaveBeenCalled()
	})

	it('throws when the token does not exist', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(
			useCase.execute({ code: 'RCI-NOPE', userId: 'user-1', data: {} }),
		).rejects.toThrow(QrTokenNotFoundError)
	})
})
