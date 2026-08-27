import { requireServerSession } from '@/shared/helpers/session.server'

export async function publishLoader({ request }: { request: Request }) {
	await requireServerSession(request)
	return null
}
