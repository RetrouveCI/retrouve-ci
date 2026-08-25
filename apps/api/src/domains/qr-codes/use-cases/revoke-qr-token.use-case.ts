import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireOwnedQrToken } from '../helpers/require-owned-qr-token'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken } from '../types/qr-token.types'

interface RevokeQrTokenInput {
	code: string
	userId: string
}

@Injectable()
export class RevokeQrTokenUseCase implements IDomainUseCase<
	RevokeQrTokenInput,
	QrToken
> {
	constructor(private readonly repository: QrTokenRepository) {}

	async execute({ code, userId }: RevokeQrTokenInput): Promise<QrToken> {
		await requireOwnedQrToken(this.repository, code, userId)

		return this.repository.revoke(code)
	}
}
