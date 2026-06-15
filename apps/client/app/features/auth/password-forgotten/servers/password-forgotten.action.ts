import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { phoneNumberSchema } from '../password-forgotten.schema'
import { requestPasswordReset } from './password-forgotten.service'

export async function passwordForgottenAction({
	request,
}: {
	request: Request
}) {
	const submission = phoneNumberSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) return data({ ok: false }, { status: 400 })

	try {
		await requestPasswordReset(submission.data.phoneNumber, request)
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false }, { status: 400 })
	}
}
