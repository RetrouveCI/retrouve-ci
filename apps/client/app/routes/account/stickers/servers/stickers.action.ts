import { redirect } from 'react-router'
import { z } from 'zod'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { getServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import {
	activateSticker,
	revokeSticker,
	updateSticker,
} from './stickers.service'

const optionalText = z
	.string()
	.optional()
	.transform(v => (v ? v : undefined))

const actionSchema = z.discriminatedUnion('intent', [
	z.object({
		intent: z.literal('activate'),
		code: z.string(),
		label: z.string(),
		linkedObject: optionalText,
	}),
	z.object({
		intent: z.literal('update'),
		code: z.string(),
		label: z.string(),
		linkedObject: optionalText,
	}),
	z.object({ intent: z.literal('revoke'), code: z.string() }),
])

const UNAUTHORIZED = { redirectOnUnauthorized: '/auth/login' }

export async function stickersAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth/login')

	const submission = actionSchema.safeParse(
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
	const content = { label, linkedObject }

	return withApiOperationError(
		() =>
			intent === 'activate'
				? activateSticker(code, content, request)
				: updateSticker(code, content, request),
		UNAUTHORIZED,
	)
}
