import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { MATCHING_QUEUE } from '@/infrastructures/queue/queue.constants'
import { LostItemsController } from './lost-items.controller'

@Module({
	imports: [
		LostItemsDomainModule,
		BullModule.registerQueue({ name: MATCHING_QUEUE }),
	],
	controllers: [LostItemsController],
})
export class LostItemsModule {}
