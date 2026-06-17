import { data } from 'react-router'
import type { Route } from '../+types/index'
import { ApiError } from '@/shared/lib/api-client'
import { parseWithZod } from '@conform-to/zod'
import { qrContactSchema } from '../qr-contact.schema'
import { contactQrOwner } from './qr-contact.service'

export async function qrContactAction({ request, params }: Route.ActionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: qrContactSchema })

	if (submission.status !== 'success') {
		return data({ ok: false, submission: submission.reply() }, { status: 400 })
	}

	const { email, ...rest } = submission.value
	const payload = { ...rest, ...(email ? { email } : {}) }

	try {
		await contactQrOwner(params.code, payload)
		return { ok: true, submission: submission.reply() }
	} catch (err) {
		if (err instanceof ApiError) {
			return data(
				{ ok: false, error: err.message, submission: submission.reply() },
				{ status: err.status },
			)
		}
		return data({ ok: false, submission: submission.reply() }, { status: 500 })
	}
}
