import {
	lostItemTypeSchema,
	moderationStatusSchema,
} from '@app/contracts/lost-items'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { toUnreadReplies } from '../helpers/unread-replies'
import { listPosts, listUnreadThreads } from './posts.service'

export async function postsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const rawType = url.searchParams.get('type')

	// An unknown value in the query string means "no filter", not an error: the
	// page is reachable from a hand-edited URL.
	const moderationStatus = moderationStatusSchema.safeParse(rawStatus).data
	const type = lostItemTypeSchema.safeParse(rawType).data

	// An indicator must never take the list down with it.
	const [{ items, total }, unreadThreads] = await Promise.all([
		listPosts({ moderationStatus, type }, request),
		listUnreadThreads(request).catch(() => []),
	])

	return {
		posts: items,
		total,
		statusFilter: rawStatus ?? 'all',
		typeFilter: rawType ?? 'all',
		unreadReplies: toUnreadReplies(unreadThreads),
	}
}
