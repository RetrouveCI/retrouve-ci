import { Injectable } from '@nestjs/common'
import {
	resolvePeriod,
	type DashboardPeriodData,
} from '@app/contracts/reporting'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { ReportingRepository } from '../repository/reporting.repository'
import type { DashboardStats } from '../types/dashboard-stats.types'

@Injectable()
export class GetDashboardStatsUseCase implements IDomainUseCase<
	DashboardPeriodData,
	DashboardStats
> {
	constructor(private readonly repository: ReportingRepository) {}

	/**
	 * The window is resolved here rather than in the repository: what « the last
	 * thirty days » means is a business decision, and the repository only knows
	 * how to count between two moments.
	 */
	async execute(period: DashboardPeriodData): Promise<DashboardStats> {
		return this.repository.getDashboardStats(resolvePeriod(period))
	}
}
