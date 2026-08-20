import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import { generateQrTokens } from '../../servers/qr.service'
import type { QrToken } from '../../types/qr.types'
import { generateQrPayloadSchema } from '../generate.schema'

export async function generateQrAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<QrToken[]>> {
	await requireAdminSession(request)

	const submission = generateQrPayloadSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const { count, batch } = submission.data

	return withApiOperationData(
		() => generateQrTokens(count, batch || undefined, request),
		{ redirectOnUnauthorized: '/auth/login' },
	)
}
