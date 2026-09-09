import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildPublicLostItem,
	buildRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import { FindMatchesUseCase } from '../find-matches.use-case'

describe('FindMatchesUseCase', () => {
	let repository: LostItemRepository
	let useCase: FindMatchesUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new FindMatchesUseCase(repository)
	})

	it('returns the matches of a published source', async () => {
		const strongMatch = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			title: 'iPhone retrouvé',
			description: 'Trouvé près du marché de Cocody',
			eventDate: new Date('2026-01-02'),
		})
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ type: 'lost' }),
		)
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([strongMatch])

		const result = await useCase.execute('lost-item-1')

		expect(result).toHaveLength(1)
		expect(result[0]?.lostItem).toEqual(
			buildPublicLostItem({
				id: 'lost-item-2',
				type: 'found',
				title: 'iPhone retrouvé',
				description: 'Trouvé près du marché de Cocody',
				eventDate: new Date('2026-01-02'),
			}),
		)
	})

	/** The route is anonymous — the loudest of the four public reads. */
	it('never carries the document number of a candidate', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ type: 'lost', category: 'documents' }),
		)
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([
			buildLostItem({
				id: 'lost-item-2',
				type: 'found',
				category: 'documents',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: 'CI0012345678',
			}),
		])

		const result = await useCase.execute('lost-item-1')

		expect(result[0]?.lostItem).not.toHaveProperty('documentNumber')
		expect(JSON.stringify(result)).not.toContain('CI0012345678')
	})

	it('throws when the source does not exist, without searching', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.findMatchCandidates).not.toHaveBeenCalled()
	})

	/** A public route: an unpublished source must not be searchable either. */
	it('throws when the source is not published, without searching', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ moderationStatus: 'pending' }),
		)

		await expect(useCase.execute('lost-item-1')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.findMatchCandidates).not.toHaveBeenCalled()
	})
})
