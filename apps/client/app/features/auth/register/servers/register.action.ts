import { data } from 'react-router'
import { z } from 'zod'
import { requireServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import { setInitialPassword } from './register.service'

const actionSchema = z.object({
	intent: z.literal('set-initial-password'),
	newPassword: z
		.string()
		.min(6, 'Le mot de passe doit contenir au moins 6 caractères.')
		.max(128),
})

export async function registerAction({ request }: { request: Request }) {
	await requireServerSession(request)

	const submission = actionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return data({ ok: false }, { status: 400 })
	}

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
