import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import { stickerOrderSchema } from '../order.schema'
import { createStickerOrder } from './order.service'
import { toOrder } from '../../../account/orders/mappers/order.mapper'
import type { Order } from '../../../account/orders/types/orders.types'

export async function orderAction(
	request: Request,
): Promise<ActionResult<Order>> {
	await requireServerSession(request)

	const formData = await request.formData()
	const submission = stickerOrderSchema.safeParse(Object.fromEntries(formData))

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const order = submission.data

	return withApiOperationData(
		async () =>
			toOrder(
				await createStickerOrder(
					{
						packId: order.packId,
						deliveryAddress: order.address,
						deliveryCity: order.city,
						deliveryNotes: `Contact: ${order.name} (${order.phone}).`,
						...(order.couponCode ? { couponCode: order.couponCode } : {}),
					},
					request,
				),
			),
		{ redirectOnUnauthorized: '/login' },
	)
}
