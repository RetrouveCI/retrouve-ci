import { requireAdminSession } from '@/shared/helpers/session.server'

export async function profileLoader({ request }: { request: Request }) {
	const session = await requireAdminSession(request)
	return { user: session.user }
}
