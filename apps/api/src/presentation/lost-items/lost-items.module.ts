import { Module } from '@nestjs/common'
import { LOST_ITEM_REPOSITORY } from '@/domains/lost-items/repository/lost-item.repository'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import { LostItemRepositoryService } from '@/domains/lost-items/repository/lost-item.repository.service'
import { LostItemsController } from './controllers/lost-items.controller'

@Module({
	controllers: [LostItemsController],
	providers: [
		LostItemUseCases,
		{
			provide: LOST_ITEM_REPOSITORY,
			useClass: LostItemRepositoryService,
		},
	],
})
export class LostItemsModule {}
