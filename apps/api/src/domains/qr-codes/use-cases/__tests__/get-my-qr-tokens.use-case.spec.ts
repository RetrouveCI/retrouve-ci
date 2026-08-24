import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GetMyQrTokensUseCase } from '../get-my-qr-tokens.use-case'

describe('GetMyQrTokensUseCase', () => {
	let repository: QrTokenRepository
	let useCase: GetMyQrTokensUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetMyQrTokensUseCase(repository)
	})

	it('narrows the list to the caller', async () => {
		const response = {
			items: [buildQrToken({ userId: 'user-1', status: 'activated' as const })],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const filter = { page: 1, pageSize: 20 }
		const result = await useCase.execute({ userId: 'user-1', filter })

		expect(repository.list).toHaveBeenCalledWith({
			...filter,
			userId: 'user-1',
		})
		expect(result).toEqual(response)
	})

	/** The scoping rule: a filter cannot widen the scope to somebody else. */
	it('overrides a userId carried by the filter', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({
			userId: 'user-1',
			filter: { page: 1, pageSize: 20, userId: 'user-2' },
		})

		expect(repository.list).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 'user-1' }),
		)
	})
})
