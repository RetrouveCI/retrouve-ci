import { requireAdminSession } from '@/shared/helpers/session.server'
import { listAdminUsers } from './administrators.service'

export async function administratorsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const admins = await listAdminUsers(request)
	return { admins }
}
