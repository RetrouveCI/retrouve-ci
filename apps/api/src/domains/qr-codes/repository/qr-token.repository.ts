import type {
	QrToken,
	QrTokenListResponse,
	QrTokenPublicView,
} from '../models/qr-token.model'
import type {
	ActivateQrTokenData,
	ListQrTokensFilter,
	UpdateQrTokenData,
} from '../types/qr-token.types'

export const QR_TOKEN_REPOSITORY = Symbol('QR_TOKEN_REPOSITORY')

export interface QrTokenRepository {
	createMany(codes: string[], batch?: string): Promise<QrToken[]>
	findByCode(code: string): Promise<QrToken | null>
	findPublicView(code: string): Promise<QrTokenPublicView | null>
	activate(
		code: string,
		userId: string,
		data: ActivateQrTokenData,
	): Promise<QrToken>
	revoke(code: string): Promise<QrToken>
	updateDetails(code: string, data: UpdateQrTokenData): Promise<QrToken>
	list(filter: ListQrTokensFilter): Promise<QrTokenListResponse>
}
