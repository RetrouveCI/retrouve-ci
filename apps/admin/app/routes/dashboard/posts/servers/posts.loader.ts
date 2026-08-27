import {
	lostItemTypeSchema,
	moderationStatusSchema,
} from '@app/contracts/lost-items'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listPosts } from './posts.service'

export async function postsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const rawType = url.searchParams.get('type')

	// An unknown value in the query string means "no filter", not an error: the
	// page is reachable from a hand-edited URL.
	const moderationStatus = moderationStatusSchema.safeParse(rawStatus).data
	const type = lostItemTypeSchema.safeParse(rawType).data

	const { items, total } = await listPosts({ moderationStatus, type }, request)

	return {
		posts: items,
		total,
		statusFilter: rawStatus ?? 'all',
		typeFilter: rawType ?? 'all',
	}
}
