import { createEventSchema, eventStatusSchema } from '@app/contracts/events'
import { rootError, zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { createEvent, deleteEvent, updateEvent } from './events.service'

const API_OPTIONS = { redirectOnUnauthorized: '/login' }

export async function eventsAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	if (intent === 'create' || intent === 'update') {
		const submission = createEventSchema.safeParse(Object.fromEntries(formData))

		if (!submission.success) {
			return { success: false, errors: zodErrorToFieldErrors(submission.error) }
		}

		const { commune, ...rest } = submission.data
		const payload = { ...rest, ...(commune ? { commune } : {}) }

		if (intent === 'update') {
			if (!id) return rootError("L'événement à modifier est introuvable")

			return withApiOperationError(
				() => updateEvent(id, payload, request),
				API_OPTIONS,
			)
		}

		return withApiOperationError(
			() => createEvent(payload, request),
			API_OPTIONS,
		)
	}

	if (intent === 'update-status') {
		if (!id) return rootError("L'événement à mettre à jour est introuvable")

		const parsed = eventStatusSchema.safeParse(formData.get('status'))
		if (!parsed.success) return rootError('Statut invalide')

		return withApiOperationError(
			() => updateEvent(id, { status: parsed.data }, request),
			API_OPTIONS,
		)
	}

	if (intent === 'delete') {
		if (!id) return rootError("L'événement à supprimer est introuvable")
		return withApiOperationError(() => deleteEvent(id, request), API_OPTIONS)
	}

	return rootError('Action inconnue')
}
