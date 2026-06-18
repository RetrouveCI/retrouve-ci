import { requireAdminSession } from '@/shared/auth/auth.server'
import { listAdminUsers } from './administrators.service'

export async function administratorsLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const cookie = request.headers.get('cookie') ?? ''
	const origin = request.headers.get('origin') ?? ''
	const admins = await listAdminUsers({ cookie, origin })
	return { admins }
}
