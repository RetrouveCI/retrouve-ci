import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { markAsRead, markAllAsRead } from './notifications.service'

export async function notificationsAction({ request }: { request: Request }) {
	await requireAdminSession(request)
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	try {
		if (intent === 'mark-read' && id) {
			const notification = await markAsRead(id, request)
			return { ok: true, notification, intent }
		}

		if (intent === 'mark-all-read') {
			await markAllAsRead(request)
			return { ok: true, intent }
		}

		return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false, error: 'Erreur serveur' }, { status: 500 })
	}
}
