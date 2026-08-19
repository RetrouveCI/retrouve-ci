import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { forgotPasswordSchema } from '../forgot-password.schema'
import { requestPasswordReset } from './forgot-password.service'

export async function forgotPasswordAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const submission = forgotPasswordSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	return withApiOperationError(() =>
		requestPasswordReset(submission.data.email, request),
	)
}
