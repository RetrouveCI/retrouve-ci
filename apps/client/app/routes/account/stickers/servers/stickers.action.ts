import { redirect } from 'react-router'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { getServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { stickersActionSchema } from '../stickers.schema'
import {
	activateSticker,
	revokeSticker,
	updateSticker,
} from './stickers.service'

const UNAUTHORIZED = { redirectOnUnauthorized: '/login' }

export async function stickersAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const session = await getServerSession(request)
	if (!session) throw redirect('/login')

	const submission = stickersActionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	if (submission.data.intent === 'revoke') {
		const { code } = submission.data

		return withApiOperationError(
			() => revokeSticker(code, request),
			UNAUTHORIZED,
		)
	}

	const { intent, code, label, linkedObject } = submission.data
	// An empty description clears the field rather than being sent as `''`.
	const content = { label, linkedObject: linkedObject || undefined }

	return withApiOperationError(
		() =>
			intent === 'activate'
				? activateSticker(code, content, request)
				: updateSticker(code, content, request),
		UNAUTHORIZED,
	)
}
