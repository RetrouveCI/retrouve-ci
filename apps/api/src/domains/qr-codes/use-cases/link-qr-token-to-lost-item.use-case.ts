import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { QrTokenNotActivatedError } from '../errors/qr-token.errors'
import { requireOwnedQrToken } from '../helpers/require-owned-qr-token'
import { QrTokenRepository } from '../repository/qr-token.repository'

interface LinkQrTokenToLostItemInput {
	code: string
	userId: string
	lostItemId: string
}

/**
 * Called by `lost-items` when a listing names one of the poster's stickers.
 * `requireOwnedQrToken` is the whole security of it: without it a listing could
 * point at a stranger's sticker, and `/q/:code` would show their object as lost.
 */
@Injectable()
export class LinkQrTokenToLostItemUseCase implements IDomainUseCase<
	LinkQrTokenToLostItemInput,
	void
> {
	constructor(private readonly repository: QrTokenRepository) {}

	async execute({
		code,
		userId,
		lostItemId,
	}: LinkQrTokenToLostItemInput): Promise<void> {
		const token = await requireOwnedQrToken(this.repository, code, userId)

		// Generated or revoked, no finder can scan it: the link would be a dead end.
		if (token.status !== 'activated') {
			throw new QrTokenNotActivatedError()
		}

		await this.repository.linkToLostItem(code, lostItemId)
	}
}
