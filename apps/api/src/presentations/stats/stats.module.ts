import { Module } from '@nestjs/common'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { ReportingDomainModule } from '@/domains/reporting/reporting-domain.module'
import { StatsController } from './stats.controller'

@Module({
	// The counters count lost items and the push figure lives with the
	// notifications, but all three are read as stats — hence the three.
	imports: [
		ReportingDomainModule,
		LostItemsDomainModule,
		NotificationsDomainModule,
	],
	controllers: [StatsController],
})
export class StatsModule {}
