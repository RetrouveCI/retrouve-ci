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
 * Backoffice accounts have no place on the public app.
 *
 * The API runs a single better-auth instance, so the admin app and this one
 * share one session cookie: signing in on the backoffice would otherwise make
 * that admin a signed-in *user* here, able to publish listings and message
 * people as themselves. This is the single choke point that refuses it — every
 * loader and action goes through `getServerSession`, so none of them has to
 * remember the rule.
 *
 * It does not make the two sessions independent: the cookie is still shared, so
 * signing in here still replaces the backoffice session. Separating them for
 * real means two better-auth instances with distinct cookie namespaces.
 */
function belongsToThisApp(session: ServerSession | null): boolean {
	return session?.user.role !== 'admin'
}

export async function getServerSession(
	request: Request,
): Promise<ServerSession | null> {
	try {
		const session = await apiFetch<ServerSession | null>(
			'/api/auth/get-session',
			{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
		)

		return belongsToThisApp(session) ? session : null
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
