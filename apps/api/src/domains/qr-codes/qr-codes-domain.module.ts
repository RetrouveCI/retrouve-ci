import { Module } from '@nestjs/common'
import { QrTokenRepository } from './repository/qr-token.repository'
import { ActivateQrTokenUseCase } from './use-cases/activate-qr-token.use-case'
import { GenerateQrTokensUseCase } from './use-cases/generate-qr-tokens.use-case'
import { GetMyQrTokensUseCase } from './use-cases/get-my-qr-tokens.use-case'
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
]

@Module({
	providers,
	exports: providers,
})
export class QrCodesDomainModule {}
