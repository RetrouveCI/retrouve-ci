import { data, redirect } from 'react-router'
import { z } from 'zod'
import { getServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import {
	deleteLostItem,
	updateLostItemResolution,
} from './account-posts.service'

const actionSchema = z.discriminatedUnion('intent', [
	z.object({ intent: z.literal('delete'), id: z.string() }),
	z.object({
		intent: z.literal('update-status'),
		id: z.string(),
		status: z.enum(['active', 'resolved', 'expired']),
	}),
])

export async function accountPostsAction({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth/login')

	const submission = actionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return data({ ok: false }, { status: 400 })
	}

	try {
		if (submission.data.intent === 'delete') {
			await deleteLostItem(submission.data.id, request)
		} else {
			await updateLostItemResolution(
				submission.data.id,
				submission.data.status,
				request,
			)
		}
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError && err.status === 401)
			throw redirect('/auth/login')
		return data({ ok: false }, { status: 400 })
	}
}
