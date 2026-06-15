import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import {
	resendOtpActionSchema,
	resetPasswordActionSchema,
} from '../reset-password.schema'
import { requestPasswordResetOtp, resetPassword } from './reset-password.service'

export async function resetPasswordAction({ request }: { request: Request }) {
	const formData = Object.fromEntries(await request.formData())

	switch (formData.intent) {
		case 'resend-otp': {
			const submission = resendOtpActionSchema.safeParse(formData)
			if (!submission.success) return data({ ok: false }, { status: 400 })

			try {
				await requestPasswordResetOtp(submission.data.phoneNumber, request)
				return { ok: true }
			} catch (err) {
				if (err instanceof ApiError) {
					return data({ ok: false, error: err.message }, { status: err.status })
				}
				return data({ ok: false }, { status: 400 })
			}
		}
		case 'reset-password': {
			const submission = resetPasswordActionSchema.safeParse(formData)
			if (!submission.success) return data({ ok: false }, { status: 400 })

			try {
				await resetPassword(submission.data, request)
				return { ok: true }
			} catch (err) {
				if (err instanceof ApiError) {
					return data({ ok: false, error: err.message }, { status: err.status })
				}
				return data({ ok: false }, { status: 400 })
			}
		}
		default:
			return data({ ok: false }, { status: 400 })
	}
}
