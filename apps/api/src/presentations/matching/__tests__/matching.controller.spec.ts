import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildLostItem } from '@/domains/lost-items/__tests__/lost-item.fixture'
import type { FindMatchesUseCase } from '@/domains/matching/use-cases/find-matches.use-case'
import { MatchingController } from '../matching.controller'

describe('MatchingController', () => {
	let findMatchesUseCase: FindMatchesUseCase
	let controller: MatchingController

	beforeEach(() => {
		findMatchesUseCase = {
			execute: vi.fn(),
		} as unknown as FindMatchesUseCase
		controller = new MatchingController(findMatchesUseCase)
	})

	it('delegates to the use-case', async () => {
		const matches = [{ lostItem: buildLostItem(), score: 75 }]
		vi.mocked(findMatchesUseCase.execute).mockResolvedValue(matches)

		expect(await controller.findMatches('lost-item-1')).toEqual(matches)
		expect(findMatchesUseCase.execute).toHaveBeenCalledWith('lost-item-1')
	})
})
