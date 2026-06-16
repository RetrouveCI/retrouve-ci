import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardStats } from '../models/dashboard-stats.model'
import type { ReportingRepository } from '../repository/reporting.repository'
import { ReportingUseCases } from './reporting.use-cases'

function buildDashboardStats(): DashboardStats {
	const stat = { value: 0, change: 0 }
	return {
		qrGenerated: stat,
		qrActivated: stat,
		scans: stat,
		contacts: stat,
		postsLost: stat,
		postsFound: stat,
		newUsers: stat,
		activityChart: [],
		categoryChart: [],
		recentActivities: [],
	}
}

function buildRepository(): ReportingRepository {
	return {
		getDashboardStats: vi.fn(),
	}
}

describe('ReportingUseCases', () => {
	let repository: ReportingRepository
	let useCases: ReportingUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new ReportingUseCases(repository)
	})

	describe('getDashboardStats', () => {
		it('delegates to the repository', async () => {
			const stats = buildDashboardStats()
			vi.mocked(repository.getDashboardStats).mockResolvedValue(stats)

			const result = await useCases.getDashboardStats()

			expect(repository.getDashboardStats).toHaveBeenCalledOnce()
			expect(result).toEqual(stats)
		})
	})
})
