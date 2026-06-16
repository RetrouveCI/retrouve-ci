import { requireAdminSession } from '@/shared/auth/auth.server'
import { listUsers } from './users.service'
import type { UserStatus } from '../users.types'

const VALID_STATUSES: UserStatus[] = ['active', 'inactive']

export async function usersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const statusFilter = VALID_STATUSES.includes(rawStatus as UserStatus)
		? (rawStatus as UserStatus)
		: undefined

	const cookie = request.headers.get('cookie') ?? ''
	const { users, total } = await listUsers(cookie, statusFilter)

	return { users, total, statusFilter: rawStatus ?? 'all' }
}
