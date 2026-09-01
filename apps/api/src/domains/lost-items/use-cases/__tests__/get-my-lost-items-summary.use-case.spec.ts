import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/lost-item.fixture'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import type { LostItemOwnerSummary } from '../../types/lost-item.types'
import { GetMyLostItemsSummaryUseCase } from '../get-my-lost-items-summary.use-case'

const SUMMARY: LostItemOwnerSummary = {
	total: 6,
	lifecycle: { active: 3, resolved: 2, expired: 1 },
	moderation: { pending: 1, published: 4, hidden: 1 },
}

describe('GetMyLostItemsSummaryUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetMyLostItemsSummaryUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetMyLostItemsSummaryUseCase(repository)
	})

	it('counts both state axes for the caller', async () => {
		vi.mocked(repository.summarizeByOwner).mockResolvedValue(SUMMARY)

		const result = await useCase.execute('user-1')

		expect(repository.summarizeByOwner).toHaveBeenCalledWith('user-1')
		expect(result).toEqual(SUMMARY)
	})

	/** The scoping rule: the caller's id is the only argument there is. */
	it('asks for nobody else', async () => {
		vi.mocked(repository.summarizeByOwner).mockResolvedValue(SUMMARY)

		await useCase.execute('user-2')

		expect(repository.summarizeByOwner).toHaveBeenCalledExactlyOnceWith(
			'user-2',
		)
	})
})
