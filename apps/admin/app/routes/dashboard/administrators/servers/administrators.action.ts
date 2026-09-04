import { requestOrigin } from '@/shared/helpers/origin'
import { rootError, zodErrorToFieldErrors } from '@/shared/helpers/form'
import { appUrl } from '@/shared/helpers/redirect'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import {
	adminCreateSchema,
	adminUpdateRoleSchema,
} from '../administrators.schema'
import {
	banAdminUser,
	createAdminUser,
	removeAdminUser,
	sendPasswordReset,
	setAdminRole,
	unbanAdminUser,
} from './administrators.service'

const API_OPTIONS = { redirectOnUnauthorized: '/login' }

export async function administratorsAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	await requireAdminSession(request)

	const headers = {
		cookie: request.headers.get('cookie') ?? '',
		origin: requestOrigin(request),
	}
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	const id = String(formData.get('id') ?? '')

	if (intent === 'create') {
		const submission = adminCreateSchema.safeParse(Object.fromEntries(formData))

		if (!submission.success) {
			return { success: false, errors: zodErrorToFieldErrors(submission.error) }
		}

		const { phone, ...rest } = submission.data

		return withApiOperationError(
			() => createAdminUser(headers, { ...rest, ...(phone ? { phone } : {}) }),
			API_OPTIONS,
		)
	}

	if (intent === 'update') {
		const submission = adminUpdateRoleSchema.safeParse({
			role: formData.get('role'),
		})

		if (!submission.success) {
			return { success: false, errors: zodErrorToFieldErrors(submission.error) }
		}
		if (!id) return rootError("L'administrateur à modifier est introuvable")

		return withApiOperationError(
			() => setAdminRole(headers, id, submission.data.role),
			API_OPTIONS,
		)
	}

	if (intent === 'toggle-status') {
		if (!id)
			return rootError("L'administrateur à mettre à jour est introuvable")

		const disabling = String(formData.get('status') ?? '') === 'inactive'

		return withApiOperationError(
			() =>
				disabling ? banAdminUser(headers, id) : unbanAdminUser(headers, id),
			API_OPTIONS,
		)
	}

	if (intent === 'delete') {
		if (!id) return rootError("L'administrateur à supprimer est introuvable")

		return withApiOperationError(
			() => removeAdminUser(headers, id),
			API_OPTIONS,
		)
	}

	if (intent === 'reset-password') {
		const email = String(formData.get('email') ?? '')
		if (!email)
			return rootError("L'administrateur à réinitialiser est introuvable")

		return withApiOperationError(
			() =>
				sendPasswordReset(headers, email, appUrl('/reset-password', request)),
			API_OPTIONS,
		)
	}

	return rootError('Action inconnue')
}
