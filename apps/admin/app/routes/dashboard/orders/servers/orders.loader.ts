import { stickerOrderStatusSchema } from '@app/contracts/sticker-orders'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listOrders } from './orders.service'

export async function ordersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const parsedStatus = stickerOrderStatusSchema.safeParse(rawStatus)
	const status = parsedStatus.success ? parsedStatus.data : undefined

	const { items, total } = await listOrders({ status }, request)

	return { orders: items, total, statusFilter: rawStatus ?? 'all' }
}
