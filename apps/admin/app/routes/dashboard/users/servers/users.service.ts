import { requestOrigin } from '@/shared/helpers/origin'
import { apiFetch } from '@/shared/utils/api-fetch'
import type { User, UserStatus } from '../types/users.types'

interface BetterAuthUser {
	id: string
	name: string
	email: string
	image: string | null
	createdAt: string
	role: string
	banned: boolean | null
	phoneNumber: string | null
}

function mapUser(u: BetterAuthUser): User {
	return {
		id: u.id,
		name: u.name,
		email: u.email,
		phone: u.phoneNumber ?? null,
		avatar: u.image ?? null,
		status: u.banned ? 'inactive' : 'active',
		createdAt: u.createdAt,
	}
}

// Sorted by the database, not by this list: the limit is a ceiling rather than
// pagination, so an unsorted call answers an arbitrary 500 accounts.
const LIST_QUERY = 'limit=500&sortBy=createdAt&sortDirection=desc'

export async function listUsers(
	request: Request,
	statusFilter?: UserStatus,
): Promise<{ users: User[]; total: number }> {
	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		`/api/admin-auth/admin/list-users?${LIST_QUERY}&filterField=role&filterOperator=eq&filterValue=user`,
		{ request },
	)

	let users = res.users.filter(u => u.role === 'user').map(mapUser)

	if (statusFilter === 'active')
		users = users.filter(u => u.status === 'active')
	if (statusFilter === 'inactive')
		users = users.filter(u => u.status === 'inactive')

	return { users, total: res.users.filter(u => u.role === 'user').length }
}

export async function getUserById(
	request: Request,
	userId: string,
): Promise<User | null> {
	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		`/api/admin-auth/admin/list-users?filterField=id&filterOperator=eq&filterValue=${encodeURIComponent(userId)}`,
		{ request },
	)
	const found = res.users.find(u => u.role === 'user')
	return found ? mapUser(found) : null
}

export async function banUser(request: Request, userId: string): Promise<void> {
	await apiFetch('/api/admin-auth/admin/ban-user', {
		method: 'POST',
		request,
		headers: { Origin: requestOrigin(request) },
		body: JSON.stringify({ userId }),
	})
}

export async function unbanUser(
	request: Request,
	userId: string,
): Promise<void> {
	await apiFetch('/api/admin-auth/admin/unban-user', {
		method: 'POST',
		request,
		headers: { Origin: requestOrigin(request) },
		body: JSON.stringify({ userId }),
	})
}
