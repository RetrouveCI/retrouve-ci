import { data } from 'react-router'
import { requireServerSession } from '@/shared/helpers/session.server'
import { ApiError } from '@/shared/utils/api-fetch'
import {
	sendOtpActionSchema,
	setInitialPasswordActionSchema,
} from '../register.schema'
import { setInitialPassword, sendOtp } from './register.service'

export async function registerAction({ request }: { request: Request }) {
	const formData = Object.fromEntries(await request.formData())

	switch (formData.intent) {
		case 'send-otp': {
			const submission = sendOtpActionSchema.safeParse(formData)
			if (!submission.success) return data({ ok: false }, { status: 400 })

			try {
				await sendOtp(submission.data.phoneNumber, request)
				return { ok: true }
			} catch (err) {
				if (err instanceof ApiError) {
					return data({ ok: false, error: err.message }, { status: err.status })
				}
				return data({ ok: false }, { status: 400 })
			}
		}
		case 'set-initial-password': {
			await requireServerSession(request)

			const submission = setInitialPasswordActionSchema.safeParse(formData)
			if (!submission.success) return data({ ok: false }, { status: 400 })

			try {
				await setInitialPassword(submission.data.newPassword, request)
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
