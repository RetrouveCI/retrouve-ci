import { Module } from '@nestjs/common'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { ReportingDomainModule } from '@/domains/reporting/reporting-domain.module'
import { StatsController } from './stats.controller'

@Module({
	// The counters count lost items; the route is a stats one, hence both.
	imports: [ReportingDomainModule, LostItemsDomainModule],
	controllers: [StatsController],
})
export class StatsModule {}
