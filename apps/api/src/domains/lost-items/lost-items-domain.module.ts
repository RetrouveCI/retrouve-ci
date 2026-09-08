import { Module } from '@nestjs/common'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { QrCodesDomainModule } from '@/domains/qr-codes/qr-codes-domain.module'
import { LostItemRepository } from './repository/lost-item.repository'
import { CreateLostItemUseCase } from './use-cases/create-lost-item.use-case'
import { DeleteLostItemUseCase } from './use-cases/delete-lost-item.use-case'
import { GetMyLostItemsSummaryUseCase } from './use-cases/get-my-lost-items-summary.use-case'
import { GetMyLostItemsUseCase } from './use-cases/get-my-lost-items.use-case'
import { GetPaginatedLostItemsUseCase } from './use-cases/get-paginated-lost-items.use-case'
import { GetPublicLostItemsUseCase } from './use-cases/get-public-lost-items.use-case'
import { ModerateLostItemUseCase } from './use-cases/moderate-lost-item.use-case'
import { ContactLostItemPosterUseCase } from './use-cases/contact-lost-item-poster.use-case'
import { UpdateLostItemUseCase } from './use-cases/update-lost-item.use-case'
import { ViewLostItemUseCase } from './use-cases/view-lost-item.use-case'

const providers = [
	LostItemRepository,
	CreateLostItemUseCase,
	ViewLostItemUseCase,
	ContactLostItemPosterUseCase,
	GetPaginatedLostItemsUseCase,
	GetPublicLostItemsUseCase,
	GetMyLostItemsUseCase,
	GetMyLostItemsSummaryUseCase,
	UpdateLostItemUseCase,
	ModerateLostItemUseCase,
	DeleteLostItemUseCase,
]

/**
 * `create` links the sticker a listing names, so it writes through `qr-codes`,
 * and tells the desk through `notifications`. No cycle — neither reaches here.
 */
@Module({
	imports: [QrCodesDomainModule, NotificationsDomainModule],
	providers,
	exports: providers,
})
export class LostItemsDomainModule {}
