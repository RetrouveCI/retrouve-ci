import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import {
	batchUpdateStickerOrderStatusSchema,
	stickerOrderStatusSchema,
} from '@app/contracts/sticker-orders'
import type { BatchOutcome } from '@app/contracts/shared'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { StickerOrder } from '../types/orders.types'
import { updateOrderStatus, updateOrderStatusBatch } from './orders.service'

export async function ordersAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<StickerOrder | BatchOutcome>> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const id = String(formData.get('id') ?? '')
	const status = stickerOrderStatusSchema.safeParse(formData.get('status')).data

	// A selection carries ids and no id. ⚠️ The contract refuses `cancelled`
	// here, so the one transition that unpromises a delivery cannot arrive.
	if (formData.get('intent') === 'status-batch') {
		const parsed = batchUpdateStickerOrderStatusSchema.safeParse({
			ids: formData.getAll('ids').map(String),
			status: formData.get('status') ?? undefined,
		})

		if (!parsed.success) {
			return { success: false, errors: zodErrorToFieldErrors(parsed.error) }
		}

		return withApiOperationData(
			() => updateOrderStatusBatch(parsed.data, request),
			{ redirectOnUnauthorized: '/login' },
		)
	}

	if (!id || !status) return rootError('Paramètres invalides')

	return withApiOperationData(() => updateOrderStatus(id, status, request), {
		redirectOnUnauthorized: '/login',
	})
}
