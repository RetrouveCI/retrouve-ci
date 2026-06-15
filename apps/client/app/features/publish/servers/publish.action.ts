import { redirect, data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { publishFormSchema } from '../publish.schema'
import { createLostItem } from './publish.service'
import { getServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import type { LostItemType } from '@/shared/types/lost-item'

export async function publishAction(request: Request, type: LostItemType) {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth')

	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: publishFormSchema })

	if (submission.status !== 'success') {
		return data(submission.reply(), { status: 400 })
	}

	const v = submission.value

	try {
		const created = await createLostItem(
			{
				type,
				category: v.objectType,
				title: v.title,
				description: v.description,
				ville: v.ville,
				commune: v.commune || undefined,
				eventDate: v.date
					? new Date(v.date).toISOString()
					: new Date().toISOString(),
				contactName: v.name,
				contactWhatsapp: `+225${v.whatsapp}`,
			},
			request,
		)
		return redirect(`/posts/${created.id}?published=1`)
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) throw redirect('/auth')
		const message =
			err instanceof ApiError ? err.message : 'Une erreur est survenue.'
		return data(submission.reply({ formErrors: [message] }), { status: 400 })
	}
}
