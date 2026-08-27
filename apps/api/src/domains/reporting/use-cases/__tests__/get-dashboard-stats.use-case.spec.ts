import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildDashboardStats,
	buildRepository,
} from '../../__tests__/dashboard-stats.fixture'
import type { ReportingRepository } from '../../repository/reporting.repository'
import { GetDashboardStatsUseCase } from '../get-dashboard-stats.use-case'

describe('GetDashboardStatsUseCase', () => {
	let repository: ReportingRepository
	let useCase: GetDashboardStatsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetDashboardStatsUseCase(repository)
	})

	it('returns the stats the repository computes', async () => {
		const stats = buildDashboardStats()
		vi.mocked(repository.getDashboardStats).mockResolvedValue(stats)

		expect(await useCase.execute()).toEqual(stats)
		expect(repository.getDashboardStats).toHaveBeenCalledOnce()
	})
})
