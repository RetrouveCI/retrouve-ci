import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { resetPasswordSchema } from '../reset-password.schema'
import { resetPassword } from './reset-password.service'

export async function resetPasswordAction({ request }: { request: Request }) {
	const submission = resetPasswordSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) return data({ ok: false }, { status: 400 })

	try {
		await resetPassword(
			submission.data.newPassword,
			submission.data.token,
			request,
		)
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false }, { status: 400 })
	}
}
