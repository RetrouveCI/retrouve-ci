import { data } from 'react-router'
import { ApiError } from '@/shared/utils/api-fetch'
import { getQrTokenPublicView } from './qr-contact.service'

export async function qrContactLoader({
	params,
}: {
	params: { code: string }
}) {
	try {
		const token = await getQrTokenPublicView(params.code)
		return { token }
	} catch (err) {
		if (err instanceof ApiError && err.status === 404) {
			throw data(null, { status: 404 })
		}
		throw err
	}
}
