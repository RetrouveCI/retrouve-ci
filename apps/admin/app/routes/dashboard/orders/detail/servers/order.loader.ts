import { requireAdminSession } from '@/shared/helpers/session.server'
import { getOrder } from '../../servers/orders.service'

export async function orderLoader({
	request,
	params,
}: {
	request: Request
	params: { id: string }
}) {
	await requireAdminSession(request)

	return { order: await getOrder(params.id, request) }
}
