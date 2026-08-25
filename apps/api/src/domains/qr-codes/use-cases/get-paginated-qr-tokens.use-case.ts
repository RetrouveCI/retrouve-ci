import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type {
	ListQrTokensFilter,
	QrTokenListResponse,
} from '../types/qr-token.types'

@Injectable()
export class GetPaginatedQrTokensUseCase implements IDomainUseCase<
	ListQrTokensFilter,
	QrTokenListResponse
> {
	constructor(private readonly repository: QrTokenRepository) {}

	async execute(filter: ListQrTokensFilter): Promise<QrTokenListResponse> {
		return this.repository.list(filter)
	}
}
