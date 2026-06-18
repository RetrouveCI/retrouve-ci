import { redirect } from 'react-router'
import { apiFetch } from '@/shared/lib/api-client'
import { loginUrlWithRedirect, sanitizeRedirect } from './redirect'

interface ServerSession {
	session: { id: string; userId: string }
	user: {
		id: string
		name: string
		email: string
		phoneNumber: string | null
		phoneNumberVerified: boolean | null
		city: string | null
		commune: string | null
		createdAt: string
	}
}

export async function getServerSession(
	request: Request,
): Promise<ServerSession | null> {
	try {
		return await apiFetch<ServerSession | null>('/api/auth/get-session', {
			headers: { Cookie: request.headers.get('cookie') ?? '' },
		})
	} catch {
		return null
	}
}

export async function requireServerSession(
	request: Request,
): Promise<ServerSession> {
	const session = await getServerSession(request)
	if (!session) {
		const url = new URL(request.url)
		throw redirect(loginUrlWithRedirect(url.pathname + url.search))
	}
	return session
}

/**
 * Guard for auth pages (login, register, …): an already-authenticated user
 * should never see them — send them back to where they came from (or the
 * default landing page). Call from each auth route's loader.
 */
export async function redirectIfAuthenticated(request: Request): Promise<void> {
	const session = await getServerSession(request)
	if (session) {
		const url = new URL(request.url)
		throw redirect(sanitizeRedirect(url.searchParams.get('redirectTo')))
	}
}
