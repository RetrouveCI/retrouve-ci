import { requestOrigin } from '@/shared/helpers/origin'
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

export async function listAdminUsers(request: Request): Promise<Admin[]> {
	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		'/api/admin-auth/admin/list-users?limit=200&filterField=role&filterOperator=ne&filterValue=user',
		{ request },
	)
	return res.users.filter(u => u.role !== 'user').map(mapUser)
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
