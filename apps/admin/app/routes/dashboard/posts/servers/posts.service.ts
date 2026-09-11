import type {
	CreateOfficialLostItemInput,
	UpdateModerationStatusData,
} from '@app/contracts/lost-items'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	ModerationStatus,
	LostItemType,
	Post,
	PostComment,
	PostListResponse,
	UnreadThread,
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

export async function getPostThread(
	id: string,
	request: Request,
): Promise<PostComment[]> {
	return apiFetch<PostComment[]>(`/lost-items/${id}/comments`, { request })
}

/** The desk's own path: the poster's carries a ceiling the desk must not spend. */
export async function commentOnPost(
	id: string,
	body: string,
	request: Request,
): Promise<PostComment> {
	return apiFetch<PostComment>(`/lost-items/${id}/comments/desk`, {
		method: 'POST',
		body: JSON.stringify({ body }),
		request,
	})
}

export async function markPostThreadRead(
	id: string,
	request: Request,
): Promise<void> {
	await apiFetch<void>(`/lost-items/${id}/comments/read`, {
		method: 'PATCH',
		request,
	})
}

export async function listUnreadThreads(
	request: Request,
): Promise<UnreadThread[]> {
	return apiFetch<UnreadThread[]>('/lost-items/comments/unread', { request })
}
