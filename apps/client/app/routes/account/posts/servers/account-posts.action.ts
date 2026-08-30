import { redirect } from 'react-router'
import { z } from 'zod'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { getServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import {
	deleteLostItem,
	updateLostItemResolution,
} from './account-posts.service'

const actionSchema = z.discriminatedUnion('intent', [
	z.object({ intent: z.literal('delete'), id: z.string() }),
	z.object({
		intent: z.literal('update-status'),
		id: z.string(),
		status: z.enum(['active', 'resolved', 'expired']),
	}),
])

export async function accountPostsAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const session = await getServerSession(request)
	if (!session) throw redirect('/login')

	const submission = actionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	if (submission.data.intent === 'delete') {
		const { id } = submission.data

		return withApiOperationError(() => deleteLostItem(id, request), {
			redirectOnUnauthorized: '/login',
		})
	}

	const { id, status } = submission.data

	return withApiOperationError(
		() => updateLostItemResolution(id, status, request),
		{ redirectOnUnauthorized: '/login' },
	)
}
