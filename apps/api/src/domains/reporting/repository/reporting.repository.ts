import type { DashboardStats } from '../models/dashboard-stats.model'

export const REPORTING_REPOSITORY = Symbol('REPORTING_REPOSITORY')

export interface ReportingRepository {
	getDashboardStats(): Promise<DashboardStats>
}
