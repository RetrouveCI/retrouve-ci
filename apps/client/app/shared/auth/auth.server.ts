import { redirect } from 'react-router'
import { apiFetch } from '@/shared/lib/api-client'

interface ServerSession {
	session: { id: string; userId: string }
	user: { id: string; name: string; email: string }
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
	if (!session) throw redirect('/auth')
	return session
}
