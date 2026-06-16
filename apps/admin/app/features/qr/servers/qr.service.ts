import { apiFetch } from '@/shared/lib/api-client'
import type { QrToken, QrTokenListResponse, QrTokenStatus } from '../qr.types'

export async function listQrTokens(
	params: { status?: QrTokenStatus; page?: number; pageSize?: number },
	request: Request,
): Promise<QrTokenListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 25),
	})

	if (params.status) query.set('status', params.status)

	return apiFetch<QrTokenListResponse>(`/qr-codes?${query.toString()}`, {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function getQrTokenByCode(code: string): Promise<QrToken> {
	return apiFetch<QrToken>(`/qr-codes/${code}`)
}

export async function revokeQrToken(
	code: string,
	request: Request,
): Promise<QrToken> {
	return apiFetch<QrToken>(`/qr-codes/${code}/revoke`, {
		method: 'POST',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function generateQrTokens(
	count: number,
	batch: string | undefined,
	request: Request,
): Promise<QrToken[]> {
	return apiFetch<QrToken[]>('/qr-codes/generate', {
		method: 'POST',
		body: JSON.stringify({ count, batch }),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
