import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { banUser, unbanUser } from './users.service'

const API_OPTIONS = { redirectOnUnauthorized: '/login' }

export async function usersAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const userId = String(formData.get('userId') ?? '')

	if (!userId) return rootError('ID manquant')

	if (intent === 'ban') {
		return withApiOperationError(() => banUser(request, userId), API_OPTIONS)
	}

	if (intent === 'unban') {
		return withApiOperationError(() => unbanUser(request, userId), API_OPTIONS)
	}

	return rootError('Intent inconnu')
}
