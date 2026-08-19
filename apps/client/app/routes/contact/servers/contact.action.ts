import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { contactSchema } from '../contact.schema'
import { submitContactMessage } from './contact.service'

export async function contactAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const submission = contactSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	return withApiOperationError(() =>
		submitContactMessage(submission.data, request),
	)
}
