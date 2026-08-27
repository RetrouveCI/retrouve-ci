import { qrTokenStatusSchema } from '@app/contracts/qr-codes'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { listQrTokens } from './qr.service'

export async function qrLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const parsedStatus = qrTokenStatusSchema.safeParse(rawStatus)
	const status = parsedStatus.success ? parsedStatus.data : undefined

	const { items, total } = await listQrTokens({ status }, request)

	return { tokens: items, total, statusFilter: rawStatus ?? 'all' }
}
