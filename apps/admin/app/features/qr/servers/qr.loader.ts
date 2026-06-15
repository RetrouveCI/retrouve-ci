import { requireAdminSession } from '@/shared/auth/auth.server'
import { listQrTokens } from './qr.service'
import type { QrTokenStatus } from '../qr.types'

const VALID_STATUSES: QrTokenStatus[] = ['generated', 'activated', 'revoked']

export async function qrLoader({ request }: { request: Request }) {
	await requireAdminSession(request)

	const url = new URL(request.url)
	const rawStatus = url.searchParams.get('status')
	const status = VALID_STATUSES.includes(rawStatus as QrTokenStatus)
		? (rawStatus as QrTokenStatus)
		: undefined

	const { items, total } = await listQrTokens({ status }, request)

	return { tokens: items, total, statusFilter: rawStatus ?? 'all' }
}
