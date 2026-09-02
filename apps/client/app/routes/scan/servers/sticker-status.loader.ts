import type { StickerStatus } from '@/shared/types/sticker'
import { getQrTokenPublicView } from '../../q/servers/qr-contact.service'
import { parseStickerCode } from '../helpers/sticker-code'

export interface ScannedStickerStatus {
	/** Echoed back so the caller can tell this answer from a previous one. */
	code: string
	status: StickerStatus | null
}

/**
 * Is this sticker still waiting to be activated? Its own route, because the
 * answer is wanted per code read and not per navigation — the shape
 * `publish/matches` uses.
 *
 * `null` means « send them to `/q/:code` », the answer to everything that is
 * not a waiting sticker, an unreachable API included: the contact screen is the
 * honest destination for a code whose state cannot be read.
 */
export async function loader({
	request,
}: {
	request: Request
}): Promise<ScannedStickerStatus> {
	const raw = new URL(request.url).searchParams.get('code') ?? ''
	const parsed = parseStickerCode(raw)

	if (!parsed.ok) return { code: raw, status: null }

	try {
		const view = await getQrTokenPublicView(parsed.code)

		return { code: parsed.code, status: view.status }
	} catch {
		return { code: parsed.code, status: null }
	}
}
