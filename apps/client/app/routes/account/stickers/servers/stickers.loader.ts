import { requireServerSession } from '@/shared/helpers/session.server'
import { toSticker } from '../mappers/sticker.mapper'
import { getMyStickerSummary, getMyStickers } from './stickers.service'

export async function stickersLoader({ request }: { request: Request }) {
	await requireServerSession(request)

	const [items, summary] = await Promise.all([
		getMyStickers(request),
		getMyStickerSummary(request),
	])

	return { stickers: items.map(toSticker), summary }
}
