import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { MATCHING_QUEUE } from '@/domains/matching/constants'
import { LOST_ITEM_REPOSITORY } from '@/domains/lost-items/repository/lost-item.repository'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import { LostItemRepositoryService } from '@/domains/lost-items/repository/lost-item.repository.service'
import { LostItemsController } from './controllers/lost-items.controller'

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
