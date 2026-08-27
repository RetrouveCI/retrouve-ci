import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import {
	resendOtpActionSchema,
	resetPasswordActionSchema,
} from '../reset-password.schema'
import {
	requestPasswordResetOtp,
	resetPassword,
} from './reset-password.service'

export async function resetPasswordAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const formData = Object.fromEntries(await request.formData())

	switch (formData.intent) {
		case 'resend-otp': {
			const submission = resendOtpActionSchema.safeParse(formData)
			if (!submission.success) {
				return {
					success: false,
					errors: zodErrorToFieldErrors(submission.error),
				}
			}

			return withApiOperationError(() =>
				requestPasswordResetOtp(submission.data.phoneNumber, request),
			)
		}
		case 'reset-password': {
			const submission = resetPasswordActionSchema.safeParse(formData)
			if (!submission.success) {
				return {
					success: false,
					errors: zodErrorToFieldErrors(submission.error),
				}
			}

			return withApiOperationError(() =>
				resetPassword(submission.data, request),
			)
		}
		default:
			return { success: false }
	}
}
