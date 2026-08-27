import { requireServerSession } from '@/shared/helpers/session.server'
import { toOrder } from '../mappers/order.mapper'
import { getMyStickerOrders } from './orders.service'

export async function ordersLoader({ request }: { request: Request }) {
	await requireServerSession(request)
	const items = await getMyStickerOrders(request)
	return { orders: items.map(toOrder) }
}
