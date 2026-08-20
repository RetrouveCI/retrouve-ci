import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { qrContactSchema } from '../qr-contact.schema'
import { contactQrOwner } from './qr-contact.service'

export async function qrContactAction({
	request,
	params,
}: {
	request: Request
	params: { code: string }
}): Promise<ActionResult> {
	const formData = await request.formData()
	const submission = qrContactSchema.safeParse(Object.fromEntries(formData))

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const { email, ...rest } = submission.data

	return withApiOperationError(() =>
		contactQrOwner(params.code, { ...rest, ...(email ? { email } : {}) }),
	)
}
