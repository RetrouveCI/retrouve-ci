import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { requireAdminSession } from '@/shared/auth/auth.server'
import {
	getContactMessageById,
	updateContactMessageStatus,
} from './contact-messages.service'

export async function contactMessagesAction({
	request,
}: {
	request: Request
}) {
	await requireAdminSession(request)
	const formData = await request.formData()
	const intent = formData.get('intent')
	const id = String(formData.get('id') ?? '')

	if (!id) return data({ ok: false, error: 'ID manquant' }, { status: 400 })

	try {
		if (intent === 'view') {
			const message = await getContactMessageById(id, request)
			return { ok: true, message }
		}

		if (intent === 'archive') {
			const message = await updateContactMessageStatus(id, 'archived', request)
			return { ok: true, message }
		}

		return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false, error: 'Erreur serveur' }, { status: 500 })
	}
}
