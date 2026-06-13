import { Inject, Injectable } from '@nestjs/common'
import {
	QrTokenAlreadyActivatedError,
	QrTokenNotFoundError,
	QrTokenRevokedError,
} from '../errors/qr-token.errors'
import { generateQrCode } from '../helpers/generate-qr-code'
import type { QrToken, QrTokenListResponse } from '../models/qr-token.model'
import {
	QR_TOKEN_REPOSITORY,
	type QrTokenRepository,
} from '../repository/qr-token.repository'
import type {
	ActivateQrTokenData,
	GenerateQrTokensData,
	ListQrTokensFilter,
} from '../types/qr-token.types'
import { validateGenerateQrTokens } from '../validators/qr-token.validator'

@Injectable()
export class QrTokenUseCases {
	constructor(
		@Inject(QR_TOKEN_REPOSITORY)
		private readonly qrTokenRepository: QrTokenRepository,
	) {}

	async generateBatch(data: GenerateQrTokensData): Promise<QrToken[]> {
		validateGenerateQrTokens(data)

		const codes = Array.from({ length: data.count }, () => generateQrCode())

		return this.qrTokenRepository.createMany(codes, data.batch)
	}

	async getByCode(code: string): Promise<QrToken> {
		const qrToken = await this.qrTokenRepository.findByCode(code)

		if (!qrToken) {
			throw new QrTokenNotFoundError(code)
		}

		return qrToken
	}

	async activate(
		code: string,
		userId: string,
		data: ActivateQrTokenData,
	): Promise<QrToken> {
		const qrToken = await this.getByCode(code)

		if (qrToken.status === 'activated') {
			throw new QrTokenAlreadyActivatedError(code)
		}

		if (qrToken.status === 'revoked') {
			throw new QrTokenRevokedError(code)
		}

		return this.qrTokenRepository.activate(code, userId, data)
	}

	async revoke(code: string): Promise<QrToken> {
		await this.getByCode(code)

		return this.qrTokenRepository.revoke(code)
	}

	async list(filter: ListQrTokensFilter): Promise<QrTokenListResponse> {
		return this.qrTokenRepository.list(filter)
	}

	async listMine(
		userId: string,
		filter: ListQrTokensFilter,
	): Promise<QrTokenListResponse> {
		return this.qrTokenRepository.list({ ...filter, userId })
	}
}
