import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { phoneNumberSchema } from '../password-forgotten.schema'
import { requestPasswordReset } from './password-forgotten.service'

export async function passwordForgottenAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const submission = phoneNumberSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	return withApiOperationError(() =>
		requestPasswordReset(submission.data.phoneNumber, request),
	)
}
