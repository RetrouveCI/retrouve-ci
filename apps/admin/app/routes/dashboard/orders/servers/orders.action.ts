import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import { stickerOrderStatusSchema } from '@app/contracts/sticker-orders'
import type { StickerOrder } from '../types/orders.types'
import { updateOrderStatus } from './orders.service'

export async function ordersAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<StickerOrder>> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const id = String(formData.get('id') ?? '')
	const status = stickerOrderStatusSchema.safeParse(formData.get('status')).data

	if (!id || !status) return rootError('Paramètres invalides')

	return withApiOperationData(() => updateOrderStatus(id, status, request), {
		redirectOnUnauthorized: '/login',
	})
}
