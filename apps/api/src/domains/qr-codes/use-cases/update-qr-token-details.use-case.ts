import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireOwnedQrToken } from '../helpers/require-owned-qr-token'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken, QrTokenDetailsData } from '../types/qr-token.types'

interface UpdateQrTokenDetailsInput {
	code: string
	userId: string
	data: QrTokenDetailsData
}

@Injectable()
export class UpdateQrTokenDetailsUseCase implements IDomainUseCase<
	UpdateQrTokenDetailsInput,
	QrToken
> {
	constructor(private readonly repository: QrTokenRepository) {}

	async execute({
		code,
		userId,
		data,
	}: UpdateQrTokenDetailsInput): Promise<QrToken> {
		await requireOwnedQrToken(this.repository, code, userId)

		return this.repository.updateDetails(code, data)
	}
}
