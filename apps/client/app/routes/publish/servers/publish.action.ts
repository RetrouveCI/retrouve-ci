import { redirect } from 'react-router'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { getServerSession } from '@/shared/helpers/session.server'
import type { LostItemType } from '@/shared/types/lost-item'
import { publishFormSchema } from '../publish.schema'
import { createLostItem } from './publish.service'
import { collectPhotoUrls } from './upload.service'

export async function publishAction(
	request: Request,
	type: LostItemType,
): Promise<ActionResult> {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth/login')

	const formData = await request.formData()
	const submission = publishFormSchema.safeParse(Object.fromEntries(formData))

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const values = submission.data

	// The success path redirects, so it throws from inside the wrapper:
	// `withApiOperationError` only converts an `ApiError` into a form error and
	// rethrows everything else, the `redirect()` response included.
	return withApiOperationError(
		async () => {
			const photos = await collectPhotoUrls(formData, request)

			const created = await createLostItem(
				{
					type,
					category: values.objectType,
					title: values.title,
					description: values.description,
					ville: values.ville,
					commune: values.commune || undefined,
					eventDate: values.date,
					contactName: values.name,
					contactWhatsapp: values.whatsapp,
					photos: photos.length ? photos : undefined,
				},
				request,
			)

			throw redirect(`/posts/${created.id}`)
		},
		{ redirectOnUnauthorized: '/auth/login' },
	)
}
