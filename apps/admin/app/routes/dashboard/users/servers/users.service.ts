import { requestOrigin } from '@/shared/helpers/origin'
import { apiFetch } from '@/shared/utils/api-fetch'
import type { User } from '../types/users.types'

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

/**
 * better-auth takes **one** search field. A visitor's e-mail is
 * `<numéro>@phone.retrouveci.local`, so digits search the e-mail — the number —
 * and anything else the name. Written once, for the list and the ⌘K palette
 * alike, so a person is found the same way from both.
 */
export function searchParamsFor(query: string): Record<string, string> {
	const byNumber = /[0-9]/.test(query)

	return {
		searchValue: byNumber ? query.replace(/\s/g, '') : query,
		searchField: byNumber ? 'email' : 'name',
		searchOperator: 'contains',
	}
}

/** Visitors only: the single filter better-auth offers is spent on the role. */
const ROLE_IS_USER = {
	filterField: 'role',
	filterOperator: 'eq',
	filterValue: 'user',
}

/**
 * One page, counted by the database. ⚠️ `sortBy` is not decoration: without it
 * the offset walks an arbitrary order, so page 2 could repeat page 1.
 */
export async function listUsers(
	params: { page?: number; pageSize?: number; search?: string },
	request: Request,
): Promise<{ users: User[]; total: number }> {
	const page = params.page ?? 1
	const pageSize = params.pageSize ?? 25

	const query = new URLSearchParams({
		limit: String(pageSize),
		offset: String((page - 1) * pageSize),
		sortBy: 'createdAt',
		sortDirection: 'desc',
		...ROLE_IS_USER,
		...(params.search ? searchParamsFor(params.search) : {}),
	})

	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		`/api/admin-auth/admin/list-users?${query.toString()}`,
		{ request },
	)

	return {
		users: res.users.filter(u => u.role === 'user').map(mapUser),
		// The database's count over every matching row, not the page's length.
		total: res.total,
	}
}

export async function searchUsers(
	request: Request,
	query: string,
	limit: number,
): Promise<User[]> {
	const params = new URLSearchParams({
		...searchParamsFor(query),
		limit: String(limit),
		...ROLE_IS_USER,
	})
	const res = await apiFetch<{ users: BetterAuthUser[] }>(
		`/api/admin-auth/admin/list-users?${params.toString()}`,
		{ request },
	)

	return res.users.filter(u => u.role === 'user').map(mapUser)
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
