import type { IDashboardRepository } from '@/domain/repositories/dashboard-repository'
import type { DashboardStats, ChartData } from '@/domain/entities/dashboard'
import { MOCK_DASHBOARD_STATS, MOCK_CHART_DATA } from '@/infrastructure/mock/data'

class MockDashboardRepository implements IDashboardRepository {
	async getStats(): Promise<DashboardStats> {
		return { ...MOCK_DASHBOARD_STATS }
	}

	async getChartData(): Promise<ChartData> {
		return {
			activity: [...MOCK_CHART_DATA.activity],
			postsByCategory: [...MOCK_CHART_DATA.postsByCategory],
		}
	}
}

export const dashboardRepository: IDashboardRepository =
	new MockDashboardRepository()
