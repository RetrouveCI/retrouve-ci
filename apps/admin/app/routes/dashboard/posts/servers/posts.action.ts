import { data } from 'react-router'
import { ApiError } from '@/shared/utils/api-fetch'
import { requireAdminSession } from '@/shared/helpers/session.server'
import { moderationStatusSchema } from '@app/contracts/lost-items'
import { moderatePost } from './posts.service'

export async function postsAction({ request }: { request: Request }) {
	await requireAdminSession(request)
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')
	const statusRaw = String(formData.get('moderationStatus') ?? '')

	try {
		if (intent === 'moderate' && id) {
			const parsed = moderationStatusSchema.safeParse(statusRaw)
			if (!parsed.success) {
				return data(
					{ ok: false, error: parsed.error.issues[0]?.message },
					{ status: 400 },
				)
			}
			const post = await moderatePost(id, parsed.data, request)
			return { ok: true, post, intent }
		}

		return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false, error: 'Erreur serveur' }, { status: 500 })
	}
}
