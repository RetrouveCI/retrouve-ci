import { getServerSession } from '@/shared/helpers/session.server'
import { getMyStickerSummary } from './stickers.service'

export interface PendingStickerCount {
	pending: number
}

/**
 * How many delivered stickers still wait to be named. Its own route so the
 * shell reads it once per full page load, not on every navigation. Zero on
 * anything unclear: a badge must never take the shell down.
 */
export async function loader({
	request,
}: {
	request: Request
}): Promise<PendingStickerCount> {
	try {
		const session = await getServerSession(request)
		if (!session) return { pending: 0 }

		const { pending } = await getMyStickerSummary(request)

		return { pending }
	} catch {
		return { pending: 0 }
	}
}
