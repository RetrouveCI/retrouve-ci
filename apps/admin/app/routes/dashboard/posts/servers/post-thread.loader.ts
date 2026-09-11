import { requireAdminSession } from '@/shared/helpers/session.server'
import { ApiError } from '@/shared/utils/api-fetch'
import type { PostComment } from '../types/posts.types'
import { getPostThread } from './posts.service'

// One module per mounted path: the thread's writes post where it is read.
export { action } from './post-thread.action'

interface PostThreadData {
	postId: string
	/** `null` when the API refused: a thread that cannot be read is not empty. */
	comments: PostComment[] | null
}

/**
 * A resource route, read when a detail opens rather than with the list: fifty
 * listings do not need fifty threads.
 */
export async function loader({
	request,
	params,
}: {
	request: Request
	params: { id?: string }
}): Promise<PostThreadData> {
	await requireAdminSession(request)

	const postId = params.id ?? ''

	try {
		return { postId, comments: await getPostThread(postId, request) }
	} catch (error) {
		if (error instanceof ApiError) return { postId, comments: null }
		throw error
	}
}
