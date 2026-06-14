import { getLostItems } from './lost-items.service'
import { toLostItem } from '../../mappers/lost-item.mapper'

export async function postsLoader() {
	const items = await getLostItems()
	return { listings: items.map(toLostItem) }
}
