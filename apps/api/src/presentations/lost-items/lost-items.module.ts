import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { LOST_ITEM_REPOSITORY } from '@/domains/lost-items/repository/lost-item.repository'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import { LostItemRepositoryService } from '@/domains/lost-items/repository/lost-item.repository.service'
import { LostItemsController } from './controllers/lost-items.controller'
import { MATCHING_QUEUE } from '@/infrastructures/queue/queue.constants'

@Module({
	imports: [BullModule.registerQueue({ name: MATCHING_QUEUE })],
	controllers: [LostItemsController],
	providers: [
		LostItemUseCases,
		{
			provide: LOST_ITEM_REPOSITORY,
			useClass: LostItemRepositoryService,
		},
	],
	exports: [LOST_ITEM_REPOSITORY],
})
export class LostItemsModule {}
