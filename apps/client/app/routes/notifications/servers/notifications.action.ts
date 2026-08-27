import { redirect } from 'react-router'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { getServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { notificationActionSchema } from '../notifications.schema'
import {
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from './notifications.service'

export async function action({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth/login')

	const submission = notificationActionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const { data } = submission

	return withApiOperationError(
		() =>
			data.intent === 'mark-read'
				? markNotificationAsRead(data.id, request)
				: markAllNotificationsAsRead(request),
		{ redirectOnUnauthorized: '/auth/login' },
	)
}
