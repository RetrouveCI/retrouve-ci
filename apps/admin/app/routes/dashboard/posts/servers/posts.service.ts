import type {
	CreateOfficialLostItemInput,
	UpdateModerationStatusData,
} from '@app/contracts/lost-items'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	ModerationStatus,
	LostItemType,
	Post,
	PostListResponse,
} from '../types/posts.types'

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
		request,
	})
}

export async function moderatePost(
	decision: UpdateModerationStatusData & { id: string },
	request: Request,
): Promise<Post> {
	const { id, ...body } = decision

	return apiFetch<Post>(`/lost-items/${id}/moderation`, {
		method: 'PATCH',
		body: JSON.stringify(body),
		request,
	})
}

/**
 * The team's own publication. The API stamps the owner, the badge and the
 * published status: this body fills the listing in and decides none of them.
 */
export async function createOfficialPost(
	body: CreateOfficialLostItemInput,
	request: Request,
): Promise<Post> {
	return apiFetch<Post>('/lost-items/official', {
		method: 'POST',
		body: JSON.stringify(body),
		request,
	})
}
