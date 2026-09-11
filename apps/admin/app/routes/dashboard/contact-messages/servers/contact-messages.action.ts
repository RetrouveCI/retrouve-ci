import { rootError } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import { batchUpdateContactMessageStatusSchema } from '@app/contracts/contact-messages'
import type { BatchOutcome } from '@app/contracts/shared'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ContactMessage } from '../types/contact-messages.types'
import {
	getContactMessageById,
	updateContactMessageStatus,
	updateContactMessageStatusBatch,
} from './contact-messages.service'

const API_OPTIONS = { redirectOnUnauthorized: '/login' }

export async function contactMessagesAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<ContactMessage | BatchOutcome>> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	// Before the id check: a selection carries ids, not an id.
	if (intent === 'archive-batch') {
		const parsed = batchUpdateContactMessageStatusSchema.safeParse({
			ids: formData.getAll('ids').map(String),
			status: 'archived',
		})

		if (!parsed.success) {
			return { success: false, errors: zodErrorToFieldErrors(parsed.error) }
		}

		return withApiOperationData(
			() => updateContactMessageStatusBatch(parsed.data, request),
			API_OPTIONS,
		)
	}

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
