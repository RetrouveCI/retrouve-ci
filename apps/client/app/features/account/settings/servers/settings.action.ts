import { data, redirect } from 'react-router'
import { getServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import { settingsActionSchema } from '../settings.schema'
import { deleteAccount } from './settings.service'

export async function settingsAction({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth')

	const submission = settingsActionSchema.safeParse(
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
