import { redirect } from 'react-router'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { getServerSession } from '@/shared/helpers/session.server'
import { settingsActionSchema } from '../settings.schema'
import {
	deleteAccount,
	sendPhoneChangeOtp,
	updateProfile,
} from './settings.service'

export async function settingsAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth/login')

	const submission = settingsActionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const values = submission.data

	return withApiOperationError(
		async () => {
			switch (values.intent) {
				case 'update-name':
					await updateProfile(request, { name: values.name })
					break
				case 'update-zone':
					await updateProfile(request, {
						city: values.city,
						commune: values.commune ?? '',
					})
					break
				case 'send-phone-otp':
					await sendPhoneChangeOtp(request, values.phone)
					break
				case 'delete-account':
					await deleteAccount(values.password, request)
					break
			}
		},
		{ redirectOnUnauthorized: '/auth/login' },
	)
}
