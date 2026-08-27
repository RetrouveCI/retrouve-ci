import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult, FormErrors } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { resetPasswordSchema } from '../reset-password.schema'
import { resetPassword } from './reset-password.service'

/**
 * The token travels outside the visible form, so an error on it belongs to no
 * field the user could fix — move it to `root`, which the form does render. The
 * page already refuses to show the form without a token, so this only fires on
 * a crafted request.
 */
function moveTokenErrorToRoot(
	errors: FormErrors | undefined,
): FormErrors | undefined {
	if (!errors?.token) return errors

	const { token, ...rest } = errors
	return { ...rest, root: rest.root ?? token }
}

export async function resetPasswordAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const submission = resetPasswordSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)

	if (!submission.success) {
		return {
			success: false,
			errors: moveTokenErrorToRoot(zodErrorToFieldErrors(submission.error)),
		}
	}

	return withApiOperationError(() =>
		resetPassword(submission.data.newPassword, submission.data.token, request),
	)
}
