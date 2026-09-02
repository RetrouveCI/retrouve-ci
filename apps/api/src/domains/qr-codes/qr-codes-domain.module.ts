import { Module } from '@nestjs/common'
import { ContactMessagesDomainModule } from '@/domains/contact-messages/contact-messages-domain.module'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { StickerOrdersDomainModule } from '@/domains/sticker-orders/sticker-orders-domain.module'
import { QrTokenRepository } from './repository/qr-token.repository'
import { ActivateQrTokenUseCase } from './use-cases/activate-qr-token.use-case'
import { ContactQrTokenOwnerUseCase } from './use-cases/contact-qr-token-owner.use-case'
import { GenerateQrTokensUseCase } from './use-cases/generate-qr-tokens.use-case'
import { GetMyQrTokensUseCase } from './use-cases/get-my-qr-tokens.use-case'
import { GetMyStickerSummaryUseCase } from './use-cases/get-my-sticker-summary.use-case'
import { GetPaginatedQrTokensUseCase } from './use-cases/get-paginated-qr-tokens.use-case'
import { GetQrTokenByCodeUseCase } from './use-cases/get-qr-token-by-code.use-case'
import { GetQrTokenPublicViewUseCase } from './use-cases/get-qr-token-public-view.use-case'
import { RevokeQrTokenUseCase } from './use-cases/revoke-qr-token.use-case'
import { UpdateQrTokenDetailsUseCase } from './use-cases/update-qr-token-details.use-case'

const providers = [
	QrTokenRepository,
	GenerateQrTokensUseCase,
	GetQrTokenByCodeUseCase,
	GetQrTokenPublicViewUseCase,
	ActivateQrTokenUseCase,
	RevokeQrTokenUseCase,
	UpdateQrTokenDetailsUseCase,
	GetPaginatedQrTokensUseCase,
	GetMyQrTokensUseCase,
	GetMyStickerSummaryUseCase,
	ContactQrTokenOwnerUseCase,
]

/**
 * `contactOwner` writes through the two domains it notifies, as `matching`
 * does; the activation summary reads through `sticker-orders`, whose orders
 * hold the only count of the stickers a visitor owns.
 */
@Module({
	imports: [
		ContactMessagesDomainModule,
		NotificationsDomainModule,
		StickerOrdersDomainModule,
	],
	providers,
	exports: providers,
})
export class QrCodesDomainModule {}
