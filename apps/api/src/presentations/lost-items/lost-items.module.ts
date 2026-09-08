import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { MatchingDispatcher } from '@/infrastructures/queue/matching-dispatcher.service'
import { MATCHING_QUEUE } from '@/infrastructures/queue/queue.constants'
import { RateLimitModule } from '@/shared/rate-limit/rate-limit.module'
import { LostItemsController } from './lost-items.controller'

@Module({
	imports: [
		LostItemsDomainModule,
		BullModule.registerQueue({ name: MATCHING_QUEUE }),
		RateLimitModule,
	],
	controllers: [LostItemsController],
	providers: [MatchingDispatcher],
})
export class LostItemsModule {}
