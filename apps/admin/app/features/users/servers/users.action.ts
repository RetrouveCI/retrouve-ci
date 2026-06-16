import { data } from 'react-router'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { banUser, unbanUser } from './users.service'

export async function usersAction({ request }: { request: Request }) {
	await requireAdminSession(request)

	const cookie = request.headers.get('cookie') ?? ''
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const userId = String(formData.get('userId') ?? '')

	if (!userId) return data({ ok: false, error: 'ID manquant' }, { status: 400 })

	try {
		if (intent === 'ban') {
			await banUser(cookie, userId)
			return { ok: true, intent }
		}

		if (intent === 'unban') {
			await unbanUser(cookie, userId)
			return { ok: true, intent }
		}

		return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Erreur serveur'
		return data({ ok: false, error: message }, { status: 500 })
	}
}
