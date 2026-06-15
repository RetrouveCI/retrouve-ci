import { redirect, data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { stickerOrderSchema } from '../order.schema'
import { PAYMENT_METHODS } from '../stickers-order.const'
import { createStickerOrder } from './order.service'
import { toOrder } from '../../../account/orders/mappers/order.mapper'
import { requireServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'

export async function orderAction(request: Request) {
	await requireServerSession(request)

	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: stickerOrderSchema })

	if (submission.status !== 'success') {
		return data(submission.reply(), { status: 400 })
	}

	const v = submission.value
	const paymentMethodLabel =
		PAYMENT_METHODS.find(p => p.id === v.paymentMethod)?.name ??
		v.paymentMethod

	try {
		const order = await createStickerOrder(
			{
				packId: v.packId,
				paymentMethod: v.paymentMethod,
				deliveryAddress: v.address,
				deliveryCity: v.city,
				deliveryNotes: `Contact: ${v.name} (${v.phone}). Paiement ${paymentMethodLabel} - ${v.paymentPhone}.`,
				couponCode: v.couponCode || undefined,
			},
			request,
		)
		return data({ ok: true as const, order: toOrder(order) })
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) throw redirect('/auth')
		const message =
			err instanceof ApiError ? err.message : 'Une erreur est survenue.'
		return data(submission.reply({ formErrors: [message] }), { status: 400 })
	}
}
