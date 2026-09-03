import { requireServerSession } from '@/shared/helpers/session.server'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import {
	sendOtpActionSchema,
	setInitialPasswordActionSchema,
} from '../register.schema'
import { setDisplayName, setInitialPassword, sendOtp } from './register.service'

export async function registerAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const formData = Object.fromEntries(await request.formData())

	switch (formData.intent) {
		case 'send-otp': {
			const submission = sendOtpActionSchema.safeParse(formData)
			if (!submission.success) {
				return {
					success: false,
					errors: zodErrorToFieldErrors(submission.error),
				}
			}

			return withApiOperationError(() =>
				sendOtp(submission.data.phoneNumber, request),
			)
		}
		case 'set-initial-password': {
			await requireServerSession(request)

			const submission = setInitialPasswordActionSchema.safeParse(formData)
			if (!submission.success) {
				return {
					success: false,
					errors: zodErrorToFieldErrors(submission.error),
				}
			}

			return withApiOperationError(async () => {
				await setDisplayName(submission.data.name, request)
				await setInitialPassword(submission.data.newPassword, request)
			})
		}
		default:
			return { success: false }
	}
}
