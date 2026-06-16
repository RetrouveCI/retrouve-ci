import { apiFetch } from '@/shared/lib/api-client'
import type {
	ModerationStatus,
	LostItemType,
	Post,
	PostListResponse,
} from '../posts.types'

export async function listPosts(
	params: {
		moderationStatus?: ModerationStatus
		type?: LostItemType
		page?: number
		pageSize?: number
	},
	request: Request,
): Promise<PostListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 50),
	})
	if (params.moderationStatus)
		query.set('moderationStatus', params.moderationStatus)
	if (params.type) query.set('type', params.type)

	return apiFetch<PostListResponse>(`/lost-items/admin?${query.toString()}`, {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}

export async function moderatePost(
	id: string,
	moderationStatus: ModerationStatus,
	request: Request,
): Promise<Post> {
	return apiFetch<Post>(`/lost-items/${id}/moderation`, {
		method: 'PATCH',
		body: JSON.stringify({ moderationStatus }),
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
