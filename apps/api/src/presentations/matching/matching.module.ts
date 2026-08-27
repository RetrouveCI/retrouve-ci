import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { MatchingDomainModule } from '@/domains/matching/matching-domain.module'
import { MATCHING_QUEUE } from '@/infrastructures/queue/queue.constants'
import { MatchingController } from './matching.controller'
import { MatchingConsumer } from './queue-consumers/matching.consumer'

@Module({
	imports: [
		MatchingDomainModule,
		BullModule.registerQueue({ name: MATCHING_QUEUE }),
	],
	controllers: [MatchingController],
	providers: [MatchingConsumer],
})
export class MatchingModule {}
