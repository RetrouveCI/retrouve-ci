import { data } from 'react-router'
import { ApiError } from '@/shared/lib/api-client'
import { moderatePost } from './posts.service'
import type { ModerationStatus } from '../posts.types'

const VALID_MODERATION: ModerationStatus[] = ['pending', 'published', 'hidden']

export async function postsAction({ request }: { request: Request }) {
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')
	const statusRaw = String(formData.get('moderationStatus') ?? '')

	try {
		if (intent === 'moderate' && id) {
			if (!VALID_MODERATION.includes(statusRaw as ModerationStatus)) {
				return data({ ok: false, error: 'Statut de modération invalide' }, { status: 400 })
			}
			const post = await moderatePost(id, statusRaw as ModerationStatus, request)
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
