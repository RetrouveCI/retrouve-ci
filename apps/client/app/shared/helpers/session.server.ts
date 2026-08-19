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
		phoneNumber: string | null
		phoneNumberVerified: boolean | null
		city: string | null
		commune: string | null
		createdAt: string
	}
}

/**
 * An admin is also a person who can lose their phone, so a backoffice role is
 * **not** a reason to refuse a session here: the role says who the user is, not
 * what the session was created for.
 *
 * Telling the two apart needs the audience to be carried by the session itself,
 * which is what the two-instance work does. Until then the two apps share one
 * better-auth cookie, so an admin signed in on the backoffice does appear signed
 * in here — see the note in CLAUDE.md.
 */
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
