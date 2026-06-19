import { apiFetch } from '@/shared/lib/api-client'
import type { Admin, AdminRole } from '../administrators.types'

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

interface ServerHeaders {
	cookie: string
	origin: string
}

function authHeaders(h: ServerHeaders): Record<string, string> {
	return { Cookie: h.cookie, Origin: h.origin }
}

export async function listAdminUsers(headers: ServerHeaders): Promise<Admin[]> {
	const res = await apiFetch<{ users: BetterAuthUser[]; total: number }>(
		'/api/auth/admin/list-users?limit=200&filterField=role&filterOperator=ne&filterValue=user',
		{ headers: authHeaders(headers) },
	)
	return res.users.filter(u => u.role !== 'user').map(mapUser)
}

export async function createAdminUser(
	headers: ServerHeaders,
	data: {
		name: string
		email: string
		password: string
		role: string
		phone?: string
	},
): Promise<Admin> {
	const { phone, ...rest } = data
	const res = await apiFetch<{ user: BetterAuthUser }>(
		'/api/auth/admin/create-user',
		{
			method: 'POST',
			headers: authHeaders(headers),
			body: JSON.stringify({
				...rest,
				data: phone ? { phoneNumber: phone } : undefined,
			}),
		},
	)
	return mapUser(res.user)
}

export async function setAdminRole(
	headers: ServerHeaders,
	userId: string,
	role: string,
): Promise<void> {
	await apiFetch('/api/auth/admin/set-role', {
		method: 'POST',
		headers: authHeaders(headers),
		body: JSON.stringify({ userId, role }),
	})
}

export async function banAdminUser(
	headers: ServerHeaders,
	userId: string,
): Promise<void> {
	await apiFetch('/api/auth/admin/ban-user', {
		method: 'POST',
		headers: authHeaders(headers),
		body: JSON.stringify({ userId }),
	})
}

export async function unbanAdminUser(
	headers: ServerHeaders,
	userId: string,
): Promise<void> {
	await apiFetch('/api/auth/admin/unban-user', {
		method: 'POST',
		headers: authHeaders(headers),
		body: JSON.stringify({ userId }),
	})
}

export async function removeAdminUser(
	headers: ServerHeaders,
	userId: string,
): Promise<void> {
	await apiFetch('/api/auth/admin/remove-user', {
		method: 'POST',
		headers: authHeaders(headers),
		body: JSON.stringify({ userId }),
	})
}

export async function sendPasswordReset(
	headers: ServerHeaders,
	email: string,
): Promise<void> {
	await apiFetch('/api/auth/forget-password', {
		method: 'POST',
		headers: authHeaders(headers),
		body: JSON.stringify({ email, redirectTo: '/auth/reset-password' }),
	})
}
