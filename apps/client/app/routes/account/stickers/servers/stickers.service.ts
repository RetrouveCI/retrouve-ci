import { apiFetch } from '@/shared/utils/api-fetch'
import type { StickerActivationSummary } from '@/shared/types/sticker'
import type {
	QrTokenApiDto,
	QrTokenListApiResponse,
} from '../types/stickers.types'

export async function getMyQrCodesPage(
	request: Request,
): Promise<QrTokenListApiResponse> {
	return apiFetch<QrTokenListApiResponse>('/qr-codes/mine?pageSize=50', {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function getMyStickers(
	request: Request,
): Promise<QrTokenApiDto[]> {
	return (await getMyQrCodesPage(request)).items
}

/** Read by « Mes stickers » and by the home banner, hence no filter of its own. */
export async function getMyStickerSummary(
	request: Request,
): Promise<StickerActivationSummary> {
	return apiFetch<StickerActivationSummary>('/qr-codes/mine/summary', {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
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
