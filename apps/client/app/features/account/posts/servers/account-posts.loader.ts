import { requireServerSession } from '@/shared/helpers/session.server'
import { toUserLostItem } from '@/features/lost-items/mappers/lost-item.mapper'
import { getMyLostItems } from './account-posts.service'

export async function accountPostsLoader({ request }: { request: Request }) {
	await requireServerSession(request)
	const items = await getMyLostItems(request)
	return { listings: items.map(toUserLostItem) }
}
