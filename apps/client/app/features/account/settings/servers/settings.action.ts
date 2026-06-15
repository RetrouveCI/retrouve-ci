import { data, redirect } from 'react-router'
import { z } from 'zod'
import { requireServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import { deleteAccount } from './settings.service'

const actionSchema = z.discriminatedUnion('intent', [
	z.object({
		intent: z.literal('delete-account'),
		password: z.string().min(1, 'Mot de passe requis'),
	}),
])

export async function settingsAction({ request }: { request: Request }) {
	await requireServerSession(request)

	const submission = actionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return data({ ok: false }, { status: 400 })
	}

	try {
		switch (submission.data.intent) {
			case 'delete-account':
				await deleteAccount(submission.data.password, request)
				break
		}
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) throw redirect('/auth')
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}

		return data({ ok: false }, { status: 400 })
	}
}
