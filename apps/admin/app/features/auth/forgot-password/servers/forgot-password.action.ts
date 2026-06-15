import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { forgotPasswordSchema } from '../forgot-password.schema'
import { requestPasswordReset } from './forgot-password.service'

export async function forgotPasswordAction({ request }: { request: Request }) {
	const submission = forgotPasswordSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)

	if (!submission.success) return data({ ok: false }, { status: 400 })

	try {
		await requestPasswordReset(submission.data.email, request)
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false }, { status: 400 })
	}
}
