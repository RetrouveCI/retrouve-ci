import { rootError, zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import { updateModerationStatusSchema } from '@app/contracts/lost-items'
import type { Post } from '../types/posts.types'
import { moderatePost } from './posts.service'

export async function postsAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<Post>> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	if (intent !== 'moderate') return rootError('Intent inconnu')
	if (!id) return rootError('ID manquant')

	// A field left alone by the dialog must read as absent, not as `''`: the
	// contract refuses an empty reason and an empty note alike.
	const parsed = updateModerationStatusSchema.safeParse({
		moderationStatus: formData.get('moderationStatus') ?? undefined,
		moderationReason: formData.get('moderationReason') || undefined,
		moderationReasonNote: formData.get('moderationReasonNote') || undefined,
	})

	if (!parsed.success) {
		return { success: false, errors: zodErrorToFieldErrors(parsed.error) }
	}

	return withApiOperationData(
		() => moderatePost({ id, ...parsed.data }, request),
		{ redirectOnUnauthorized: '/login' },
	)
}
