import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { updateOrderStatus } from './orders.service'
import type { OrderStatus } from '../orders.types'

const VALID_STATUSES: OrderStatus[] = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
]

export async function ordersAction({ request }: { request: Request }) {
	await requireAdminSession(request)
	const formData = await request.formData()
	const id = String(formData.get('id') ?? '')
	const status = String(formData.get('status') ?? '') as OrderStatus

	if (!id || !VALID_STATUSES.includes(status)) {
		return data({ ok: false, error: 'Paramètres invalides' }, { status: 400 })
	}

	try {
		const order = await updateOrderStatus(id, status, request)
		return { ok: true, order }
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false, error: 'Erreur serveur' }, { status: 500 })
	}
}
