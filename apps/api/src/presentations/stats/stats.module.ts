import { Module } from '@nestjs/common'
import { REPORTING_REPOSITORY } from '@/domains/reporting/repository/reporting.repository'
import { ReportingRepositoryService } from '@/domains/reporting/repository/reporting.repository.service'
import { ReportingUseCases } from '@/domains/reporting/use-cases/reporting.use-cases'
import { StatsController } from './controllers/stats.controller'

@Module({
	controllers: [StatsController],
	providers: [
		ReportingUseCases,
		{
			provide: REPORTING_REPOSITORY,
			useClass: ReportingRepositoryService,
		},
	],
})
export class StatsModule {}
