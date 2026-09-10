import { Module } from '@nestjs/common'
import { SystemAccountService } from '@/infrastructures/auth/system-account.service'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { QrCodesDomainModule } from '@/domains/qr-codes/qr-codes-domain.module'
import { LostItemRepository } from './repository/lost-item.repository'
import { CreateLostItemUseCase } from './use-cases/create-lost-item.use-case'
import { CreateOfficialLostItemUseCase } from './use-cases/create-official-lost-item.use-case'
import { DeleteLostItemUseCase } from './use-cases/delete-lost-item.use-case'
import { GetMyLostItemsSummaryUseCase } from './use-cases/get-my-lost-items-summary.use-case'
import { GetMyLostItemsUseCase } from './use-cases/get-my-lost-items.use-case'
import { GetPaginatedLostItemsUseCase } from './use-cases/get-paginated-lost-items.use-case'
import { GetPublicLostItemsUseCase } from './use-cases/get-public-lost-items.use-case'
import { GetPublicCountersUseCase } from './use-cases/get-public-counters.use-case'
import { ModerateLostItemUseCase } from './use-cases/moderate-lost-item.use-case'
import { ContactLostItemPosterUseCase } from './use-cases/contact-lost-item-poster.use-case'
import { UpdateLostItemUseCase } from './use-cases/update-lost-item.use-case'
import { ViewLostItemUseCase } from './use-cases/view-lost-item.use-case'

const providers = [
	LostItemRepository,
	// Resolves the account every team listing belongs to. Infrastructure, not a
	// use-case: it reads an identity the seeder wrote, not business state.
	SystemAccountService,
	CreateLostItemUseCase,
	CreateOfficialLostItemUseCase,
	ViewLostItemUseCase,
	ContactLostItemPosterUseCase,
	GetPaginatedLostItemsUseCase,
	GetPublicLostItemsUseCase,
	GetPublicCountersUseCase,
	GetMyLostItemsUseCase,
	GetMyLostItemsSummaryUseCase,
	UpdateLostItemUseCase,
	ModerateLostItemUseCase,
	DeleteLostItemUseCase,
]

/**
 * `create` links the sticker a listing names, so it writes through `qr-codes`,
 * and tells the desk through `notifications`. No cycle — neither reaches here.
 * `createOfficial` needs neither: it tells the desk nothing, and a system
 * account owns no sticker to link.
 */
@Module({
	imports: [QrCodesDomainModule, NotificationsDomainModule],
	providers,
	exports: providers,
})
export class LostItemsDomainModule {}
