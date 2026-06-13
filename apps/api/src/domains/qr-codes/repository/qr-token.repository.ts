import type { QrToken, QrTokenListResponse } from '../models/qr-token.model'
import type {
	ActivateQrTokenData,
	ListQrTokensFilter,
} from '../types/qr-token.types'

export const QR_TOKEN_REPOSITORY = Symbol('QR_TOKEN_REPOSITORY')

export interface QrTokenRepository {
	createMany(codes: string[], batch?: string): Promise<QrToken[]>
	findByCode(code: string): Promise<QrToken | null>
	activate(
		code: string,
		userId: string,
		data: ActivateQrTokenData,
	): Promise<QrToken>
	revoke(code: string): Promise<QrToken>
	list(filter: ListQrTokensFilter): Promise<QrTokenListResponse>
}
