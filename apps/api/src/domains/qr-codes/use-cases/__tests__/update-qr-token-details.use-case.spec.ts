import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import {
	QrTokenForbiddenError,
	QrTokenNotFoundError,
} from '../../errors/qr-token.errors'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { UpdateQrTokenDetailsUseCase } from '../update-qr-token-details.use-case'

describe('UpdateQrTokenDetailsUseCase', () => {
	let repository: QrTokenRepository
	let useCase: UpdateQrTokenDetailsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new UpdateQrTokenDetailsUseCase(repository)
	})

	it('updates the details for the owner', async () => {
		const updated = buildQrToken({
			status: 'activated',
			userId: 'user-1',
			label: 'Nouveau nom',
		})
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'user-1' }),
		)
		vi.mocked(repository.updateDetails).mockResolvedValue(updated)

		const result = await useCase.execute({
			code: 'RCI-ABC123',
			userId: 'user-1',
			data: { label: 'Nouveau nom' },
		})

		expect(repository.updateDetails).toHaveBeenCalledWith('RCI-ABC123', {
			label: 'Nouveau nom',
		})
		expect(result).toEqual(updated)
	})

	it("refuses somebody else's token without writing", async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(
			buildQrToken({ status: 'activated', userId: 'user-1' }),
		)

		await expect(
			useCase.execute({
				code: 'RCI-ABC123',
				userId: 'user-2',
				data: { label: 'Pirate' },
			}),
		).rejects.toThrow(QrTokenForbiddenError)
		expect(repository.updateDetails).not.toHaveBeenCalled()
	})

	it('throws when the token does not exist', async () => {
		vi.mocked(repository.findByCode).mockResolvedValue(null)

		await expect(
			useCase.execute({ code: 'RCI-NOPE', userId: 'user-1', data: {} }),
		).rejects.toThrow(QrTokenNotFoundError)
	})
})
