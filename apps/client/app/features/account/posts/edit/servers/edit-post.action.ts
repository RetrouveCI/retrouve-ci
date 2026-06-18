import { redirect, data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { publishFormSchema } from '@/features/publish/publish.schema'
import { collectPhotoUrls } from '@/features/publish/servers/upload.service'
import { patchLostItemContent } from '../../servers/account-posts.service'
import { requireServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'

export async function editPostAction(request: Request, id: string) {
	await requireServerSession(request)

	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: publishFormSchema })

	if (submission.status !== 'success') {
		return data(submission.reply(), { status: 400 })
	}

	const v = submission.value

	try {
		const photos = await collectPhotoUrls(formData, request)

		await patchLostItemContent(
			id,
			{
				title: v.title,
				description: v.description,
				ville: v.ville,
				commune: v.commune || undefined,
				eventDate: v.date ? new Date(v.date).toISOString() : undefined,
				contactName: v.name,
				contactWhatsapp: `+225${v.whatsapp}`,
				photos,
			},
			request,
		)

		return redirect('/account/posts')
	} catch (err) {
		if (err instanceof ApiError && err.status === 401)
			throw redirect('/auth/login')
		const message =
			err instanceof ApiError ? err.message : 'Une erreur est survenue.'
		return data(submission.reply({ formErrors: [message] }), { status: 400 })
	}
}
