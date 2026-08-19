import { redirect } from 'react-router'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationError } from '@/shared/utils/api-operation'
import { requireServerSession } from '@/shared/helpers/session.server'
import { publishFormSchema } from '@/routes/publish/publish.schema'
import { collectPhotoUrls } from '@/routes/publish/servers/upload.service'
import { patchLostItemContent } from '../../servers/account-posts.service'

export async function editPostAction(
	request: Request,
	id: string,
): Promise<ActionResult> {
	await requireServerSession(request)

	const formData = await request.formData()
	const submission = publishFormSchema.safeParse(Object.fromEntries(formData))

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const values = submission.data

	// The success path redirects from inside the wrapper — see
	// `routes/publish/servers/publish.action.ts` for why that works.
	return withApiOperationError(
		async () => {
			const photos = await collectPhotoUrls(formData, request)

			await patchLostItemContent(
				id,
				{
					title: values.title,
					description: values.description,
					ville: values.ville,
					commune: values.commune || undefined,
					eventDate: values.date
						? new Date(values.date).toISOString()
						: undefined,
					contactName: values.name,
					contactWhatsapp: `+225${values.whatsapp}`,
					photos,
				},
				request,
			)

			throw redirect('/account/posts')
		},
		{ redirectOnUnauthorized: '/auth/login' },
	)
}
