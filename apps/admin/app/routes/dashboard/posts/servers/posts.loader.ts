import { redirect } from 'react-router'
import {
	MODERATION_STATUSES,
	lostItemTypeSchema,
	moderationStatusSchema,
} from '@app/contracts/lost-items'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { countByStatus } from '@/shared/helpers/list-counts'
import {
	pastLastPage,
	readListPage,
	readSearch,
} from '@/shared/helpers/list-params'
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
	const search = readSearch(url.searchParams)
	const listPage = readListPage(url.searchParams)

	// An indicator must never take the list down with it.
	const [{ items, total }, counts, unreadThreads] = await Promise.all([
		listPosts({ moderationStatus, type, search, ...listPage }, request),
		// Counted over every row the other filters match, so the chips and the
		// grid add up to the total instead of counting the page on screen.
		countByStatus(MODERATION_STATUSES, async probe => {
			const { total: matching } = await listPosts(
				{ moderationStatus: probe, type, search, page: 1, pageSize: 1 },
				request,
			)
			return matching
		}),
		listUnreadThreads(request).catch(() => []),
	])

	const lastPage = pastLastPage(url, listPage, total)
	if (lastPage) throw redirect(lastPage)

	return {
		posts: items,
		total,
		...listPage,
		search,
		counts,
		statusFilter: rawStatus ?? 'all',
		typeFilter: rawType ?? 'all',
		unreadReplies: toUnreadReplies(unreadThreads),
	}
}
