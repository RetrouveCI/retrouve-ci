import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { activateSticker } from '../../account/stickers/servers/stickers.service'
import { activateScannedStickerSchema } from '../scan.schema'

/**
 * It calls the same service « Mes stickers » does rather than a second `fetch`,
 * as `home.loader` already reuses the listings service.
 */
export async function scanAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	await requireServerSession(request)

	const submission = activateScannedStickerSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const { code, label, linkedObject } = submission.data

	return withApiOperationError(
		// An empty description clears the field rather than being sent as `''`.
		() =>
			activateSticker(
				code,
				{ label, linkedObject: linkedObject || undefined },
				request,
			),
		{ redirectOnUnauthorized: '/login' },
	)
}
