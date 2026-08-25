import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { ReportingRepository } from '../repository/reporting.repository'
import type { DashboardStats } from '../types/dashboard-stats.types'

@Injectable()
export class GetDashboardStatsUseCase implements IDomainUseCase<
	void,
	DashboardStats
> {
	constructor(private readonly repository: ReportingRepository) {}

	async execute(): Promise<DashboardStats> {
		return this.repository.getDashboardStats()
	}
}
