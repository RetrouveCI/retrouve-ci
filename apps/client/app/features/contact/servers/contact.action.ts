import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { contactSchema } from '../contact.schema'
import { submitContactMessage } from './contact.service'

export async function contactAction({ request }: { request: Request }) {
	const submission = contactSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) return data({ ok: false }, { status: 400 })

	try {
		await submitContactMessage(submission.data, request)
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false }, { status: 400 })
	}
}
