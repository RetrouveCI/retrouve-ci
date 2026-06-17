import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReportingUseCases } from '@/domains/reporting/use-cases/reporting.use-cases'
import type { DashboardStats } from '@/domains/reporting/models/dashboard-stats.model'
import { StatsController } from './stats.controller'

function buildUseCases(): ReportingUseCases {
	return {
		getDashboardStats: vi.fn(),
	} as unknown as ReportingUseCases
}

function buildDashboardStats(): DashboardStats {
	const stat = { value: 42, change: 10 }
	return {
		qrGenerated: stat,
		qrActivated: stat,
		scans: stat,
		contacts: stat,
		postsLost: stat,
		postsFound: stat,
		newUsers: stat,
		activityChart: [{ date: '16 Jun', scans: 3, activations: 1 }],
		categoryChart: [{ category: 'PHONE', lost: 5, found: 2 }],
		recentActivities: [
			{
				id: 'act-1',
				type: 'contact',
				text: 'Konan a contacté via sticker RCI-ABC123',
				createdAt: new Date().toISOString(),
			},
		],
	}
}

describe('StatsController', () => {
	let useCases: ReportingUseCases
	let controller: StatsController

	beforeEach(() => {
		useCases = buildUseCases()
		controller = new StatsController(useCases)
	})

	describe('getDashboardStats', () => {
		it('is restricted to admins', () => {
			expect(
				Reflect.getMetadata('ROLES', controller.getDashboardStats),
			).toEqual(['admin'])
		})

		it('delegates to getDashboardStats', async () => {
			const stats = buildDashboardStats()
			vi.mocked(useCases.getDashboardStats).mockResolvedValue(stats)

			const result = await controller.getDashboardStats()

			expect(useCases.getDashboardStats).toHaveBeenCalledOnce()
			expect(result).toEqual(stats)
		})
	})
})
