import { redirect } from 'react-router'
import { createListingCommentSchema } from '@app/contracts/listing-comments'
import { rootError, zodErrorToFieldErrors } from '@/shared/helpers/form'
import { requireServerSession } from '@/shared/helpers/session.server'
import type { ActionResult } from '@/shared/types/action'
import {
	withApiOperationData,
	withApiOperationError,
} from '@/shared/utils/api-operation'
import {
	markListingThreadRead,
	replyToListingThread,
} from '../../servers/account-posts.service'
import type { ListingComment } from '../../types/thread'

const ON_UNAUTHORIZED = { redirectOnUnauthorized: '/login' }

// A resource route has no error boundary, so a reload arriving as a GET is sent
// back to the listing it belongs to.
export function loader({ params }: { params: { id: string } }) {
	return redirect(`/account/posts/${params.id}`)
}

// The thread writes apart from the edit form, whose action answers a listing.
export async function action({
	request,
	params,
}: {
	request: Request
	params: { id: string }
}): Promise<ActionResult<ListingComment>> {
	await requireServerSession(request)

	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')

	if (intent === 'read') {
		return withApiOperationError(
			() => markListingThreadRead(params.id, request),
			ON_UNAUTHORIZED,
		)
	}

	if (intent !== 'reply') return rootError('Intent inconnu')

	const parsed = createListingCommentSchema.safeParse({
		body: formData.get('body') ?? undefined,
	})

	if (!parsed.success) {
		return { success: false, errors: zodErrorToFieldErrors(parsed.error) }
	}

	return withApiOperationData(
		() => replyToListingThread(params.id, parsed.data.body, request),
		ON_UNAUTHORIZED,
	)
}
