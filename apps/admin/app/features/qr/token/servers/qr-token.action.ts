import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { revokeQrToken } from '../../servers/qr.service'

export async function qrTokenAction({
	request,
	params,
}: {
	request: Request
	params: { code: string }
}) {
	await requireAdminSession(request)
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent !== 'revoke') {
		return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
	}

	try {
		const token = await revokeQrToken(params.code, request)
		return { ok: true, token }
	} catch (err) {
		if (err instanceof ApiError) {
			const error =
				err.status === 403
					? 'Vous ne pouvez pas révoquer ce token.'
					: err.message
			return data({ ok: false, error }, { status: err.status })
		}
		return data({ ok: false, error: 'Erreur serveur' }, { status: 500 })
	}
}
