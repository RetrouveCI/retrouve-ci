import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { ApiError } from '@/shared/utils/api-fetch'
import { withApiOperationData } from '@/shared/utils/api-operation'
import type { QrToken } from '../../types/qr.types'
import { revokeQrToken } from '../../servers/qr.service'

export async function qrTokenAction({
	request,
	params,
}: {
	request: Request
	params: { code: string }
}): Promise<ActionResult<QrToken>> {
	await requireAdminSession(request)

	const formData = await request.formData()

	if (formData.get('intent') !== 'revoke') return rootError('Intent inconnu')

	return withApiOperationData(
		async () => {
			try {
				return await revokeQrToken(params.code, request)
			} catch (error) {
				// The one message this page words itself: « Forbidden » says nothing
				// to a moderator holding a token somebody else owns.
				if (error instanceof ApiError && error.status === 403) {
					throw new ApiError(403, 'Vous ne pouvez pas révoquer ce token.')
				}

				throw error
			}
		},
		{ redirectOnUnauthorized: '/login' },
	)
}
