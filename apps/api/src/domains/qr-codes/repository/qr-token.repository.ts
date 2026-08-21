import type {
	QrToken,
	QrTokenListResponse,
	QrTokenPublicView,
} from '../models/qr-token.model'
import type {
	QrTokenDetailsData,
	ListQrTokensFilter,
} from '../types/qr-token.types'

export const QR_TOKEN_REPOSITORY = Symbol('QR_TOKEN_REPOSITORY')

export interface QrTokenRepository {
	createMany(codes: string[], batch?: string): Promise<QrToken[]>
	findByCode(code: string): Promise<QrToken | null>
	findPublicView(code: string): Promise<QrTokenPublicView | null>
	activate(
		code: string,
		userId: string,
		data: QrTokenDetailsData,
	): Promise<QrToken>
	revoke(code: string): Promise<QrToken>
	updateDetails(code: string, data: QrTokenDetailsData): Promise<QrToken>
	list(filter: ListQrTokensFilter): Promise<QrTokenListResponse>
}
