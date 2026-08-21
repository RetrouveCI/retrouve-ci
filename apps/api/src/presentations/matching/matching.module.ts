import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { MATCHING_QUEUE } from '@/domains/matching/constants'
import { MatchingUseCases } from '@/domains/matching/use-cases/matching.use-cases'
import { LostItemsModule } from '@/presentations/lost-items/lost-items.module'
import { NotificationsModule } from '@/presentations/notifications/notifications.module'
import { MatchingController } from './controllers/matching.controller'
import { MatchingConsumer } from './queue-consumers/matching.consumer'

@Module({
	imports: [
		LostItemsModule,
		NotificationsModule,
		BullModule.registerQueue({ name: MATCHING_QUEUE }),
	],
	controllers: [MatchingController],
	providers: [MatchingUseCases, MatchingConsumer],
})
export class MatchingModule {}
