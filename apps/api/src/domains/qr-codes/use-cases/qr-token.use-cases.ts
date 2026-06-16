import { Inject, Injectable } from '@nestjs/common'
import {
	QrTokenAlreadyActivatedError,
	QrTokenForbiddenError,
	QrTokenNotFoundError,
	QrTokenRevokedError,
} from '../errors/qr-token.errors'
import { generateQrCode } from '../helpers/generate-qr-code'
import type {
	QrToken,
	QrTokenListResponse,
	QrTokenPublicView,
} from '../models/qr-token.model'
import {
	QR_TOKEN_REPOSITORY,
	type QrTokenRepository,
} from '../repository/qr-token.repository'
import type {
	ActivateQrTokenData,
	GenerateQrTokensData,
	ListQrTokensFilter,
	UpdateQrTokenData,
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

	async revoke(code: string, userId: string): Promise<QrToken> {
		const qrToken = await this.getByCode(code)

		if (qrToken.userId !== userId) {
			throw new QrTokenForbiddenError(code)
		}

		return this.qrTokenRepository.revoke(code)
	}

	async updateDetails(
		code: string,
		userId: string,
		data: UpdateQrTokenData,
	): Promise<QrToken> {
		const qrToken = await this.getByCode(code)

		if (qrToken.userId !== userId) {
			throw new QrTokenForbiddenError(code)
		}

		return this.qrTokenRepository.updateDetails(code, data)
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

	async getPublicView(code: string): Promise<QrTokenPublicView> {
		const view = await this.qrTokenRepository.findPublicView(code)

		if (!view) {
			throw new QrTokenNotFoundError(code)
		}

		return view
	}
}
