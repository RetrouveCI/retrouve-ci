import { requireServerSession } from '@/shared/helpers/session.server'
import { toSticker } from '../mappers/sticker.mapper'
import { getMyStickers } from './stickers.service'

export async function stickersLoader({ request }: { request: Request }) {
	await requireServerSession(request)
	const items = await getMyStickers(request)
	return { stickers: items.map(toSticker) }
}
