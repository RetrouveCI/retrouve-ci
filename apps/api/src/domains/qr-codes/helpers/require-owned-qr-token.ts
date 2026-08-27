import { QrTokenForbiddenError } from '../errors/qr-token.errors'
import type { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken } from '../types/qr-token.types'
import { requireQrToken } from './require-qr-token'

export async function requireOwnedQrToken(
	repository: QrTokenRepository,
	code: string,
	userId: string,
): Promise<QrToken> {
	const qrToken = await requireQrToken(repository, code)

	if (qrToken.userId !== userId) {
		throw new QrTokenForbiddenError(code)
	}

	return qrToken
}
