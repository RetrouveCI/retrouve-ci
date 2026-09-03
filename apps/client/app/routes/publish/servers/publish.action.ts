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
	if (!session) throw redirect('/login')

	const formData = await request.formData()
	const submission = publishFormSchema.safeParse(Object.fromEntries(formData))

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const values = submission.data

	// The success path redirects, so it throws from inside the wrapper:
	// `withApiOperationError` only converts an `ApiError` into a form error and
	// rethrows everything else, the `redirect()` response included.
	// A photo of a piece of ID hands over the name, the number and the date of
	// birth at once, so the picker is not rendered — and the files are not
	// uploaded either, whatever the submitted form happened to carry.
	const isDocument = values.objectType === 'documents'

	return withApiOperationError(
		async () => {
			const photos = isDocument ? [] : await collectPhotoUrls(formData, request)

			await createLostItem(
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
					documentType: values.documentType,
					documentHolderName: values.documentHolderName || undefined,
					documentNumber: values.documentNumber || undefined,
					documentIssuer: values.documentIssuer || undefined,
				},
				request,
			)

			// Not the listing itself: a new one is `pending`, so its public page
			// would answer 404 to the person who just wrote it. « Mes annonces »
			// is where it exists, and where the banner explains that a moderator
			// has to pass before anyone else can see it.
			throw redirect('/account/posts')
		},
		{ redirectOnUnauthorized: '/login' },
	)
}
