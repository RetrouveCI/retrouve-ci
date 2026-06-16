import { requireAdminSession } from '@/shared/auth/auth.server'
import { listAdminUsers } from './administrators.service'

export async function administratorsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const cookie = request.headers.get('cookie') ?? ''
	const admins = await listAdminUsers(cookie)
	return { admins }
}
