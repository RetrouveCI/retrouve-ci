import { rootError, zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { eventSchema, updateStatusSchema } from '../events.schema'
import { createEvent, deleteEvent, updateEvent } from './events.service'

const API_OPTIONS = { redirectOnUnauthorized: '/auth/login' }

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
		const submission = eventSchema.safeParse(Object.fromEntries(formData))

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

		const parsed = updateStatusSchema.safeParse({
			status: formData.get('status'),
		})
		if (!parsed.success) return rootError('Statut invalide')

		return withApiOperationError(
			() => updateEvent(id, { status: parsed.data.status }, request),
			API_OPTIONS,
		)
	}

	if (intent === 'delete') {
		if (!id) return rootError("L'événement à supprimer est introuvable")
		return withApiOperationError(() => deleteEvent(id, request), API_OPTIONS)
	}

	return rootError('Action inconnue')
}
