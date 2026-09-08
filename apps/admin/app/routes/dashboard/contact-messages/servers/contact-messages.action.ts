import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import type { ContactMessage } from '../types/contact-messages.types'
import {
	getContactMessageById,
	updateContactMessageStatus,
} from './contact-messages.service'

const API_OPTIONS = { redirectOnUnauthorized: '/login' }

export async function contactMessagesAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<ContactMessage>> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	if (!id) return rootError('ID manquant')

	if (intent === 'view') {
		return withApiOperationData(
			() => getContactMessageById(id, request),
			API_OPTIONS,
		)
	}

	if (intent === 'archive') {
		return withApiOperationData(
			() => updateContactMessageStatus(id, 'archived', request),
			API_OPTIONS,
		)
	}

	return rootError('Intent inconnu')
}
