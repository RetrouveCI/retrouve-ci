import { data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { ApiError } from '@/shared/lib/api-client'
import { requireAdminSession } from '@/shared/auth/auth.server'
import { createEvent, updateEvent, deleteEvent } from './events.service'
import { eventSchema, updateStatusSchema } from '../events.schema'
import type { EventStatus } from '../events.types'

export async function eventsAction({ request }: { request: Request }) {
	await requireAdminSession(request)
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	try {
		if (intent === 'create') {
			const submission = parseWithZod(formData, { schema: eventSchema })
			if (submission.status !== 'success') {
				return data(
					{ ok: false, submission: submission.reply() },
					{ status: 400 },
				)
			}
			const { commune, ...rest } = submission.value
			const event = await createEvent(
				{ ...rest, ...(commune ? { commune } : {}) },
				request,
			)
			return { ok: true, event, intent }
		}

		if (intent === 'update' && id) {
			const submission = parseWithZod(formData, { schema: eventSchema })
			if (submission.status !== 'success') {
				return data(
					{ ok: false, submission: submission.reply() },
					{ status: 400 },
				)
			}
			const { commune, ...rest } = submission.value
			const event = await updateEvent(
				id,
				{ ...rest, ...(commune ? { commune } : {}) },
				request,
			)
			return { ok: true, event, intent }
		}

		if (intent === 'update-status' && id) {
			const statusRaw = String(formData.get('status') ?? '')
			const parsed = updateStatusSchema.safeParse({ status: statusRaw })
			if (!parsed.success) {
				return data({ ok: false, error: 'Statut invalide' }, { status: 400 })
			}
			const event = await updateEvent(
				id,
				{ status: parsed.data.status as EventStatus },
				request,
			)
			return { ok: true, event, intent }
		}

		if (intent === 'delete' && id) {
			await deleteEvent(id, request)
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
