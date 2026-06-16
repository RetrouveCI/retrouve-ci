import { apiFetch } from '@/shared/lib/api-client'
import type { User, UserStatus } from '../users.types'

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

export async function listUsers(
	cookie: string,
	statusFilter?: UserStatus,
): Promise<{ users: User[]; total: number }> {
	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		'/api/auth/admin/list-users?limit=500&filterField=role&filterOperator=eq&filterValue=user',
		{ headers: { Cookie: cookie } },
	)

	let users = res.users.filter(u => u.role === 'user').map(mapUser)

	if (statusFilter === 'active') users = users.filter(u => u.status === 'active')
	if (statusFilter === 'inactive') users = users.filter(u => u.status === 'inactive')

	return { users, total: res.users.filter(u => u.role === 'user').length }
}

export async function getUserById(
	cookie: string,
	userId: string,
): Promise<User | null> {
	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		`/api/auth/admin/list-users?filterField=id&filterOperator=eq&filterValue=${encodeURIComponent(userId)}`,
		{ headers: { Cookie: cookie } },
	)
	const found = res.users.find(u => u.role === 'user')
	return found ? mapUser(found) : null
}

export async function banUser(cookie: string, userId: string): Promise<void> {
	await apiFetch('/api/auth/admin/ban-user', {
		method: 'POST',
		headers: { Cookie: cookie },
		body: JSON.stringify({ userId }),
	})
}

export async function unbanUser(cookie: string, userId: string): Promise<void> {
	await apiFetch('/api/auth/admin/unban-user', {
		method: 'POST',
		headers: { Cookie: cookie },
		body: JSON.stringify({ userId }),
	})
}
