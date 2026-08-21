import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { createContactMessageSchema } from '@app/contracts/contact-messages'
import { submitContactMessage } from './contact.service'

export async function contactAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const submission = createContactMessageSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	return withApiOperationError(() =>
		submitContactMessage(submission.data, request),
	)
}
