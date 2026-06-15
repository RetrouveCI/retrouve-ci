import { apiFetch } from '@/shared/lib/api-client'
import type { QrTokenApiDto, QrTokenListApiResponse } from '../stickers.types'

export async function getMyStickers(
	request: Request,
): Promise<QrTokenApiDto[]> {
	const response = await apiFetch<QrTokenListApiResponse>(
		'/qr-codes/mine?pageSize=50',
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
	return response.items
}

export async function activateSticker(
	code: string,
	data: { label?: string; linkedObject?: string },
	request: Request,
): Promise<QrTokenApiDto> {
	return apiFetch<QrTokenApiDto>(`/qr-codes/${code}/activate`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function updateSticker(
	code: string,
	data: { label?: string; linkedObject?: string },
	request: Request,
): Promise<QrTokenApiDto> {
	return apiFetch<QrTokenApiDto>(`/qr-codes/${code}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function revokeSticker(
	code: string,
	request: Request,
): Promise<QrTokenApiDto> {
	return apiFetch<QrTokenApiDto>(`/qr-codes/${code}/revoke`, {
		method: 'POST',
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
