import { Module } from '@nestjs/common'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { FindMatchesUseCase } from './use-cases/find-matches.use-case'
import { NotifyMatchesUseCase } from './use-cases/notify-matches.use-case'

/** No repository of its own: it reads `lost-items` and writes through `notifications`. */
@Module({
	imports: [LostItemsDomainModule, NotificationsDomainModule],
	providers: [FindMatchesUseCase, NotifyMatchesUseCase],
	exports: [FindMatchesUseCase, NotifyMatchesUseCase],
})
export class MatchingDomainModule {}
