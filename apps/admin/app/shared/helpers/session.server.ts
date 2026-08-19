import { redirect } from 'react-router'
import { apiFetch } from '@/shared/utils/api-fetch'
import { loginUrlWithRedirect, sanitizeRedirect } from './redirect'

interface ServerSession {
	session: { id: string; userId: string }
	user: {
		id: string
		name: string
		email: string
		role: string
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

export async function requireAdminSession(
	request: Request,
): Promise<ServerSession> {
	const session = await getServerSession(request)
	if (!session || session.user.role !== 'admin') {
		const url = new URL(request.url)
		throw redirect(loginUrlWithRedirect(url.pathname + url.search))
	}
	return session
}

/**
 * Guard for the auth pages: an admin who is already signed in should never see
 * them — send them to where they were headed (or the dashboard home). Called
 * once from `routes/auth/layout.tsx`, so no auth page repeats the check.
 *
 * A signed-in user who is *not* an admin stays on the page: they still have an
 * admin account to sign in with.
 */
export async function redirectIfAdminAuthenticated(
	request: Request,
): Promise<void> {
	const session = await getServerSession(request)
	if (session?.user.role === 'admin') {
		const url = new URL(request.url)
		throw redirect(sanitizeRedirect(url.searchParams.get('redirectTo')))
	}
}
