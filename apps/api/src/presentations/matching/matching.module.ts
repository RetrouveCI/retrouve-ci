import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { MatchingUseCases } from '@/domains/matching/use-cases/matching.use-cases'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { MatchingController } from './controllers/matching.controller'
import { MatchingConsumer } from './queue-consumers/matching.consumer'
import { MATCHING_QUEUE } from '@/infrastructures/queue/queue.constants'

@Module({
	imports: [
		LostItemsDomainModule,
		NotificationsDomainModule,
		BullModule.registerQueue({ name: MATCHING_QUEUE }),
	],
	controllers: [MatchingController],
	providers: [MatchingUseCases, MatchingConsumer],
})
export class MatchingModule {}
