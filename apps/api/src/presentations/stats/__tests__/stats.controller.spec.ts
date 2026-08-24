import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildDashboardStats } from '@/domains/reporting/__tests__/dashboard-stats.fixture'
import type { GetDashboardStatsUseCase } from '@/domains/reporting/use-cases/get-dashboard-stats.use-case'
import { StatsController } from '../stats.controller'

function buildUseCase(): GetDashboardStatsUseCase {
	return { execute: vi.fn() } as unknown as GetDashboardStatsUseCase
}

describe('StatsController', () => {
	let getDashboardStatsUseCase: GetDashboardStatsUseCase
	let controller: StatsController

	beforeEach(() => {
		getDashboardStatsUseCase = buildUseCase()
		controller = new StatsController(getDashboardStatsUseCase)
	})

	describe('getDashboardStats', () => {
		it('is restricted to admins', () => {
			expect(
				Reflect.getMetadata('ROLES', controller.getDashboardStats),
			).toEqual(['admin'])
		})

		it('delegates to the use-case', async () => {
			const stats = buildDashboardStats()
			vi.mocked(getDashboardStatsUseCase.execute).mockResolvedValue(stats)

			expect(await controller.getDashboardStats()).toEqual(stats)
			expect(getDashboardStatsUseCase.execute).toHaveBeenCalledOnce()
		})
	})
})
