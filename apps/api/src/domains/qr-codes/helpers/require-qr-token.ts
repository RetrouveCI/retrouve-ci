import { QrTokenNotFoundError } from '../errors/qr-token.errors'
import type { QrTokenRepository } from '../repository/qr-token.repository'
import type { QrToken } from '../types/qr-token.types'

export async function requireQrToken(
	repository: QrTokenRepository,
	code: string,
): Promise<QrToken> {
	const qrToken = await repository.findByCode(code)

	if (!qrToken) {
		throw new QrTokenNotFoundError(code)
	}

	return qrToken
}
