import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import {
	QrTokenAlreadyActivatedError,
	QrTokenRevokedError,
} from '../errors/qr-token.errors'
import { requireQrToken } from '../helpers/require-qr-token'
import { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken, QrTokenDetailsData } from '../types/qr-token.types'

interface ActivateQrTokenInput {
	code: string
	userId: string
	data: QrTokenDetailsData
}

@Injectable()
export class ActivateQrTokenUseCase implements IDomainUseCase<
	ActivateQrTokenInput,
	QrToken
> {
	constructor(private readonly repository: QrTokenRepository) {}

	/** Activation claims ownership, so it checks status rather than the owner. */
	async execute({
		code,
		userId,
		data,
	}: ActivateQrTokenInput): Promise<QrToken> {
		const qrToken = await requireQrToken(this.repository, code)

		if (qrToken.status === 'activated') {
			throw new QrTokenAlreadyActivatedError(code)
		}

		if (qrToken.status === 'revoked') {
			throw new QrTokenRevokedError(code)
		}

		return this.repository.activate(code, userId, data)
	}
}
