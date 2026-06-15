import { requireServerSession } from '@/shared/auth/auth.server'

export async function publishLoader({ request }: { request: Request }) {
	await requireServerSession(request)
	return null
}
