import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { markAsRead, markAllAsRead } from './notifications.service'

const API_OPTIONS = { redirectOnUnauthorized: '/login' }

export async function notificationsAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	// The id used to sit inside the condition, so a `mark-read` without one
	// answered « Intent inconnu » — naming the wrong problem.
	if (intent === 'mark-read') {
		if (!id) return rootError('ID manquant')

		return withApiOperationError(() => markAsRead(id, request), API_OPTIONS)
	}

	if (intent === 'mark-all-read') {
		return withApiOperationError(() => markAllAsRead(request), API_OPTIONS)
	}

	return rootError('Intent inconnu')
}
