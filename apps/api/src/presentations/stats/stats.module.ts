import { Module } from '@nestjs/common'
import { ReportingDomainModule } from '@/domains/reporting/reporting-domain.module'
import { StatsController } from './stats.controller'

@Module({
	imports: [ReportingDomainModule],
	controllers: [StatsController],
})
export class StatsModule {}
