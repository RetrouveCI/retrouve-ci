import { z } from 'zod'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listUsers } from './users.service'
import { USER_STATUSES } from '../types/users.types'

const userStatusSchema = z.enum(USER_STATUSES)

export async function usersLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')

	// An unknown value in the query string means "no filter", not an error: the
	// page is reachable from a hand-edited URL.
	const statusFilter = userStatusSchema.safeParse(rawStatus).data

	const cookie = request.headers.get('cookie') ?? ''
	const { users, total } = await listUsers(cookie, statusFilter)

	return { users, total, statusFilter: rawStatus ?? 'all' }
}
