import { requestOrigin } from '@/shared/helpers/origin'
import { searchParamsFor } from '../../users/servers/users.service'
import { apiFetch, type ApiFetchInit } from '@/shared/utils/api-fetch'
import type { EditableRole } from '../administrators.schema'
import type { Admin, AdminRole } from '../types/administrators.types'

interface BetterAuthUser {
	id: string
	name: string
	email: string
	createdAt: string
	role: string
	banned: boolean | null
	phoneNumber: string | null
}

function mapUser(user: BetterAuthUser): Admin {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phoneNumber ?? null,
		role: user.role as AdminRole,
		status: user.banned ? 'inactive' : 'active',
		createdAt: user.createdAt,
		lastLogin: null,
	}
}

// Only the mutations name an `Origin`, as they always did: the API lets it win
// over `X-Auth-Audience`, so adding one moves which instance answers.
function authInit(request: Request): ApiFetchInit {
	return { request, headers: { Origin: requestOrigin(request) } }
}

/**
 * One page, counted by the database. The single filter better-auth offers is
 * spent on the role — everything that is not a visitor — so there is no status
 * axis here either; it stays on the row. ⚠️ `sortBy` is not decoration: without
 * it the offset walks an arbitrary order and page 2 could repeat page 1.
 */
export async function listAdminUsers(
	params: { page?: number; pageSize?: number; search?: string },
	request: Request,
): Promise<{ admins: Admin[]; total: number }> {
	const page = params.page ?? 1
	const pageSize = params.pageSize ?? 25

	const query = new URLSearchParams({
		limit: String(pageSize),
		offset: String((page - 1) * pageSize),
		sortBy: 'createdAt',
		sortDirection: 'desc',
		filterField: 'role',
		filterOperator: 'ne',
		filterValue: 'user',
		...(params.search ? searchParamsFor(params.search) : {}),
	})

	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		`/api/admin-auth/admin/list-users?${query.toString()}`,
		{ request },
	)

	return {
		admins: res.users.filter(u => u.role !== 'user').map(mapUser),
		total: res.total,
	}
}

export async function createAdminUser(
	request: Request,
	data: {
		name: string
		email: string
		password: string
		role: EditableRole
		phone?: string
	},
): Promise<Admin> {
	const { phone, ...rest } = data
	const res = await apiFetch<{ user: BetterAuthUser }>(
		'/api/admin-auth/admin/create-user',
		{
			method: 'POST',
			...authInit(request),
			body: JSON.stringify({
				...rest,
				data: phone ? { phoneNumber: phone } : undefined,
			}),
		},
	)
	return mapUser(res.user)
}

export async function setAdminRole(
	request: Request,
	userId: string,
	role: EditableRole,
): Promise<void> {
	await apiFetch('/api/admin-auth/admin/set-role', {
		method: 'POST',
		...authInit(request),
		body: JSON.stringify({ userId, role }),
	})
}

export async function banAdminUser(
	request: Request,
	userId: string,
): Promise<void> {
	await apiFetch('/api/admin-auth/admin/ban-user', {
		method: 'POST',
		...authInit(request),
		body: JSON.stringify({ userId }),
	})
}

export async function unbanAdminUser(
	request: Request,
	userId: string,
): Promise<void> {
	await apiFetch('/api/admin-auth/admin/unban-user', {
		method: 'POST',
		...authInit(request),
		body: JSON.stringify({ userId }),
	})
}

export async function removeAdminUser(
	request: Request,
	userId: string,
): Promise<void> {
	await apiFetch('/api/admin-auth/admin/remove-user', {
		method: 'POST',
		...authInit(request),
		body: JSON.stringify({ userId }),
	})
}

export async function sendPasswordReset(
	request: Request,
	email: string,
	redirectTo: string,
): Promise<void> {
	await apiFetch('/api/admin-auth/request-password-reset', {
		method: 'POST',
		...authInit(request),
		body: JSON.stringify({ email, redirectTo }),
	})
}
