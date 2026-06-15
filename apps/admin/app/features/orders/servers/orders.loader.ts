import { requireAdminSession } from '@/shared/auth/auth.server'
import { listOrders } from './orders.service'
import type { OrderStatus } from '../orders.types'

const VALID_STATUSES: OrderStatus[] = [
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
]

export async function ordersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const status = VALID_STATUSES.includes(rawStatus as OrderStatus)
		? (rawStatus as OrderStatus)
		: undefined

	const { items, total } = await listOrders({ status }, request)

	return { orders: items, total, statusFilter: rawStatus ?? 'all' }
}
