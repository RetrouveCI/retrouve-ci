import { redirect } from 'react-router'
import { ApiError, apiFetch } from '@/shared/utils/api-fetch'
import { loginUrlWithRedirect, sanitizeRedirect, toRoutePath } from './redirect'

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
		return await apiFetch<ServerSession | null>('/api/admin-auth/get-session', {
			headers: { Cookie: request.headers.get('cookie') ?? '' },
		})
	} catch (error) {
		// `get-session` answers 200 with `null` when nobody is signed in, so a
		// throw means the check could not run. Reporting that as "signed out"
		// turns an unreachable API into a login loop with nothing in the logs.
		if (error instanceof ApiError && error.status === 401) return null

		console.error(`[session] backoffice session check failed`, error)
		throw error
	}
}

export async function requireAdminSession(
	request: Request,
): Promise<ServerSession> {
	const session = await getServerSession(request)
	if (!session || session.user.role !== 'admin') {
		throw redirect(loginUrlWithRedirect(toRoutePath(request.url)))
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
