import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildQrToken, buildRepository } from '../../__tests__/qr-token.fixture'
import type { QrTokenRepository } from '../../repository/qr-token.repository'
import { GetPaginatedQrTokensUseCase } from '../get-paginated-qr-tokens.use-case'

describe('GetPaginatedQrTokensUseCase', () => {
	let repository: QrTokenRepository
	let useCase: GetPaginatedQrTokensUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetPaginatedQrTokensUseCase(repository)
	})

	it('delegates the filter to the repository', async () => {
		const response = {
			items: [buildQrToken()],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const filter = { page: 1, pageSize: 20 }

		expect(await useCase.execute(filter)).toEqual(response)
		expect(repository.list).toHaveBeenCalledWith(filter)
	})

	it('adds no owner of its own', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({ page: 1, pageSize: 20 })

		expect(repository.list).toHaveBeenCalledWith(
			expect.not.objectContaining({ userId: expect.anything() }),
		)
	})
})
