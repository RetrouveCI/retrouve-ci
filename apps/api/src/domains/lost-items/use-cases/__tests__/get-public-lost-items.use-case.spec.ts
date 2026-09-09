import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { GetPublicLostItemsUseCase } from '../get-public-lost-items.use-case'

describe('GetPublicLostItemsUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetPublicLostItemsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetPublicLostItemsUseCase(repository)
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})
	})

	it('narrows the listing to what moderation has published', async () => {
		await useCase.execute({ page: 1, pageSize: 20 })

		expect(repository.list).toHaveBeenCalledWith({
			page: 1,
			pageSize: 20,
			moderationStatus: 'published',
		})
	})

	/** Applied last, so a filter carrying another status cannot widen it. */
	it('refuses to be widened by the filter it is given', async () => {
		await useCase.execute({
			page: 1,
			pageSize: 20,
			moderationStatus: 'pending',
		})

		expect(repository.list).toHaveBeenCalledWith(
			expect.objectContaining({ moderationStatus: 'published' }),
		)
	})

	it('drops the document number of every row', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [
				buildLostItem({
					documentType: 'national_id',
					documentHolderName: 'KOUASSI Jean',
					documentNumber: 'CI0012345678',
				}),
				buildLostItem({ id: 'lost-item-2' }),
			],
			total: 2,
			page: 1,
			pageSize: 20,
		})

		const result = await useCase.execute({ page: 1, pageSize: 20 })

		expect(result.total).toBe(2)
		expect(result.items[0]).not.toHaveProperty('documentNumber')
		expect(result.items[0]?.documentHolderName).toBe('KOUASSI Jean')
		expect(JSON.stringify(result)).not.toContain('CI0012345678')
	})
})
