import { Module } from '@nestjs/common'
import { LostItemRepository } from './repository/lost-item.repository'
import { CreateLostItemUseCase } from './use-cases/create-lost-item.use-case'
import { DeleteLostItemUseCase } from './use-cases/delete-lost-item.use-case'
import { GetMyLostItemsSummaryUseCase } from './use-cases/get-my-lost-items-summary.use-case'
import { GetMyLostItemsUseCase } from './use-cases/get-my-lost-items.use-case'
import { GetPaginatedLostItemsUseCase } from './use-cases/get-paginated-lost-items.use-case'
import { GetPublicLostItemsUseCase } from './use-cases/get-public-lost-items.use-case'
import { ModerateLostItemUseCase } from './use-cases/moderate-lost-item.use-case'
import { RecordLostItemContactUseCase } from './use-cases/record-lost-item-contact.use-case'
import { UpdateLostItemUseCase } from './use-cases/update-lost-item.use-case'
import { ViewLostItemUseCase } from './use-cases/view-lost-item.use-case'

const providers = [
	LostItemRepository,
	CreateLostItemUseCase,
	ViewLostItemUseCase,
	RecordLostItemContactUseCase,
	GetPaginatedLostItemsUseCase,
	GetPublicLostItemsUseCase,
	GetMyLostItemsUseCase,
	GetMyLostItemsSummaryUseCase,
	UpdateLostItemUseCase,
	ModerateLostItemUseCase,
	DeleteLostItemUseCase,
]

@Module({
	providers,
	exports: providers,
})
export class LostItemsDomainModule {}
