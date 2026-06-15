import { requireAdminSession } from '@/shared/auth/auth.server'
import { getQrTokenByCode } from '../../servers/qr.service'

export async function qrTokenLoader({
	request,
	params,
}: {
	request: Request
	params: { code: string }
}) {
	await requireAdminSession(request)
	const token = await getQrTokenByCode(params.code)
	return { token }
}
