import { refusesPhotos } from '@app/contracts/lost-items'
import { zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireAdminSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import { withApiOperationData } from '@/shared/utils/api-operation'
import { createOfficialPost } from '../../servers/posts.service'
import type { Post } from '../../types/posts.types'
import { newPostSchema } from '../new-post.schema'
import { collectPhotoUrls } from './upload.service'

export async function newPostAction({
	request,
}: {
	request: Request
}): Promise<ActionResult<Post>> {
	await requireAdminSession(request)

	const formData = await request.formData()
	const submission = newPostSchema.safeParse(Object.fromEntries(formData))

	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	const {
		commune,
		documentHolderName,
		documentNumber,
		documentIssuer,
		postedFor,
		...values
	} = submission.data

	return withApiOperationData(
		async () => {
			// The public form's rule, applied here too: a piece of ID is published
			// without a photo, whatever the submitted form happened to carry.
			const photos = refusesPhotos(values.category)
				? []
				: await collectPhotoUrls(formData, request)

			// A field left alone posts `''`; the API should read it as absent.
			return createOfficialPost(
				{
					...values,
					commune: commune || undefined,
					documentHolderName: documentHolderName || undefined,
					documentNumber: documentNumber || undefined,
					documentIssuer: documentIssuer || undefined,
					postedFor: postedFor || undefined,
					photos: photos.length ? photos : undefined,
				},
				request,
			)
		},
		{ redirectOnUnauthorized: '/login' },
	)
}
