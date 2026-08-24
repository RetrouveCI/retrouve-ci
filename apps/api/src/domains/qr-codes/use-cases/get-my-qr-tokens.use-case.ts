import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type {
	ListQrTokensFilter,
	QrTokenListResponse,
} from '../types/qr-token.types'

interface GetMyQrTokensInput {
	userId: string
	filter: ListQrTokensFilter
}

@Injectable()
export class GetMyQrTokensUseCase
	implements IDomainUseCase<GetMyQrTokensInput, QrTokenListResponse>
{
	constructor(private readonly repository: QrTokenRepository) {}

	/** `userId` last, so a filter carrying another one cannot widen the scope. */
	async execute({
		userId,
		filter,
	}: GetMyQrTokensInput): Promise<QrTokenListResponse> {
		return this.repository.list({ ...filter, userId })
	}
}
