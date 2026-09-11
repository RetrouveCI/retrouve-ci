import { requireAdminSession } from '@/shared/helpers/session.server'
import { getPost } from '../../servers/posts.service'

export async function postLoader({
	request,
	params,
}: {
	request: Request
	params: { id: string }
}) {
	await requireAdminSession(request)

	return { post: await getPost(params.id, request) }
}
