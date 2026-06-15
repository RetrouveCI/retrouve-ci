import { data, redirect } from 'react-router'
import { getServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import { notificationActionSchema } from '../notifications.schema'
import {
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from './notifications.service'

export async function action({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth')

	const submission = notificationActionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) return data({ ok: false }, { status: 400 })

	try {
		if (submission.data.intent === 'mark-read') {
			await markNotificationAsRead(submission.data.id, request)
		} else {
			await markAllNotificationsAsRead(request)
		}
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) throw redirect('/auth')
		return data(
			{ ok: false },
			{ status: err instanceof ApiError ? err.status : 400 },
		)
	}
}
