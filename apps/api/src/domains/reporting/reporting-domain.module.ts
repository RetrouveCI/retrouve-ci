import { Module } from '@nestjs/common'
import { ReportingRepository } from './repository/reporting.repository'
import { GetDashboardStatsUseCase } from './use-cases/get-dashboard-stats.use-case'

@Module({
	providers: [ReportingRepository, GetDashboardStatsUseCase],
	exports: [ReportingRepository, GetDashboardStatsUseCase],
})
export class ReportingDomainModule {}
