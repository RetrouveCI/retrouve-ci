import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CountDeliveredStickersUseCase } from '@/domains/sticker-orders/use-cases/count-delivered-stickers.use-case'
import { buildRepository } from '../../__tests__/qr-token.fixture'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GetMyStickerSummaryUseCase } from '../get-my-sticker-summary.use-case'

describe('GetMyStickerSummaryUseCase', () => {
	let repository: QrTokenRepository
	let countDelivered: CountDeliveredStickersUseCase
	let useCase: GetMyStickerSummaryUseCase

	beforeEach(() => {
		repository = buildRepository()
		countDelivered = {
			execute: vi.fn(),
		} as unknown as CountDeliveredStickersUseCase
		useCase = new GetMyStickerSummaryUseCase(repository, countDelivered)
	})

	function given(delivered: number, activated: number) {
		vi.mocked(countDelivered.execute).mockResolvedValue(delivered)
		vi.mocked(repository.countActivatedByOwner).mockResolvedValue(activated)
	}

	it('subtracts the activated tokens from the delivered quantity', async () => {
		given(12, 3)

		await expect(useCase.execute('user-1')).resolves.toEqual({
			delivered: 12,
			activated: 3,
			pending: 9,
		})
	})

	it('scopes both counts to the caller', async () => {
		given(4, 4)

		await useCase.execute('user-1')

		expect(countDelivered.execute).toHaveBeenCalledWith('user-1')
		expect(repository.countActivatedByOwner).toHaveBeenCalledWith('user-1')
	})

	/** A sticker activated outside an order of one's own: a gift, a reissue. */
	it('never answers a negative pending count', async () => {
		given(0, 2)

		await expect(useCase.execute('user-1')).resolves.toEqual({
			delivered: 2,
			activated: 2,
			pending: 0,
		})
	})

	it('answers three zeros to a visitor who owns nothing', async () => {
		given(0, 0)

		await expect(useCase.execute('user-1')).resolves.toEqual({
			delivered: 0,
			activated: 0,
			pending: 0,
		})
	})
})
