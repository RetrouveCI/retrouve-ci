import { requireAdminSession } from '@/shared/auth/auth.server'
import { listPosts } from './posts.service'
import type { ModerationStatus, LostItemType } from '../posts.types'

const VALID_MODERATION: ModerationStatus[] = ['pending', 'published', 'hidden']
const VALID_TYPES: LostItemType[] = ['lost', 'found']

export async function postsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const rawType = url.searchParams.get('type')

	const moderationStatus = VALID_MODERATION.includes(
		rawStatus as ModerationStatus,
	)
		? (rawStatus as ModerationStatus)
		: undefined

	const type = VALID_TYPES.includes(rawType as LostItemType)
		? (rawType as LostItemType)
		: undefined

	const { items, total } = await listPosts({ moderationStatus, type }, request)

	return {
		posts: items,
		total,
		statusFilter: rawStatus ?? 'all',
		typeFilter: rawType ?? 'all',
	}
}
