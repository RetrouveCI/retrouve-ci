import { rootError, zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import {
	withApiOperationData,
	withApiOperationError,
} from '@/shared/utils/api-operation'
import { createListingCommentSchema } from '@app/contracts/listing-comments'
import type { PostComment } from '../types/posts.types'
import { commentOnPost, markPostThreadRead } from './posts.service'

const ON_UNAUTHORIZED = { redirectOnUnauthorized: '/login' }

// The thread writes where it is read, so the list's own action keeps answering
// a listing and nothing else.
export async function action({
	request,
	params,
}: {
	request: Request
	params: { id?: string }
}): Promise<ActionResult<PostComment>> {
	await requireAdminSession(request)

	const id = params.id ?? ''
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')

	if (intent === 'read') {
		return withApiOperationError(
			() => markPostThreadRead(id, request),
			ON_UNAUTHORIZED,
		)
	}

	if (intent !== 'comment') return rootError('Intent inconnu')

	const parsed = createListingCommentSchema.safeParse({
		body: formData.get('body') ?? undefined,
	})

	if (!parsed.success) {
		return { success: false, errors: zodErrorToFieldErrors(parsed.error) }
	}

	return withApiOperationData(
		() => commentOnPost(id, parsed.data.body, request),
		ON_UNAUTHORIZED,
	)
}
