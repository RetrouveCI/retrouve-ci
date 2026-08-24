import { describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import { MATCH_SCORE_THRESHOLD, MAX_CANDIDATES } from '../../constants'
import { computeMatches } from '../compute-matches'

describe('computeMatches', () => {
	it('searches the opposite type, bounded by MAX_CANDIDATES', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([])

		await computeMatches(repository, buildLostItem({ type: 'lost' }))

		expect(repository.findMatchCandidates).toHaveBeenCalledWith({
			type: 'found',
			category: 'phone',
			ville: 'Abidjan',
			moderationStatus: 'published',
			resolutionStatus: 'active',
			limit: MAX_CANDIDATES,
		})
	})

	it('searches lost items when the source was found', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([])

		await computeMatches(repository, buildLostItem({ type: 'found' }))

		expect(repository.findMatchCandidates).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'lost' }),
		)
	})

	it('keeps only candidates at or above the threshold', async () => {
		const repository = buildRepository()
		const strong = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			title: 'iPhone retrouvé',
			description: 'Trouvé près du marché de Cocody',
			eventDate: new Date('2026-01-02'),
		})
		const weak = buildLostItem({
			id: 'lost-item-3',
			type: 'found',
			category: 'keys',
			ville: 'Bouaké',
			commune: 'Houphouet',
			title: 'Clés trouvées',
			description: 'Sans rapport',
			eventDate: new Date('2026-06-01'),
		})
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([strong, weak])

		const matches = await computeMatches(
			repository,
			buildLostItem({ type: 'lost' }),
		)

		expect(matches).toHaveLength(1)
		expect(matches[0]?.lostItem).toEqual(strong)
		expect(matches[0]?.score).toBeGreaterThanOrEqual(MATCH_SCORE_THRESHOLD)
	})

	it('returns an empty array when nothing scores high enough', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([
			buildLostItem({
				id: 'lost-item-2',
				type: 'found',
				category: 'keys',
				ville: 'Bouaké',
				commune: 'Houphouet',
				title: 'Clés trouvées',
				description: 'Sans rapport',
				eventDate: new Date('2026-06-01'),
			}),
		])

		expect(
			await computeMatches(repository, buildLostItem({ type: 'lost' })),
		).toEqual([])
	})

	it('sorts the matches by descending score', async () => {
		const repository = buildRepository()
		const near = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			title: 'iPhone retrouvé',
			description: 'Sans rapport',
			commune: 'Yopougon',
			eventDate: new Date('2026-02-15'),
		})
		const exact = buildLostItem({
			id: 'lost-item-3',
			type: 'found',
			title: 'iPhone retrouvé',
			description: 'Trouvé près du marché de Cocody',
			eventDate: new Date('2026-01-02'),
		})
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([near, exact])

		const matches = await computeMatches(
			repository,
			buildLostItem({ type: 'lost' }),
		)

		expect(matches.map(m => m.lostItem.id)).toEqual([
			'lost-item-3',
			'lost-item-2',
		])
	})
})
