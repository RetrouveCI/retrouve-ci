import { requireAdminSession } from '@/shared/helpers/session.server'
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
