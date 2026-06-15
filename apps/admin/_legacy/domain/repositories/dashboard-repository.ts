import type { DashboardStats, ChartData } from '@/domain/entities/dashboard'

export interface IDashboardRepository {
	getStats(): Promise<DashboardStats>
	getChartData(): Promise<ChartData>
}
