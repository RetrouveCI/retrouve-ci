import { data, redirect } from 'react-router'
import { z } from 'zod'
import { getServerSession } from '@/shared/auth/auth.server'
import { ApiError } from '@/shared/lib/api-client'
import {
	activateSticker,
	revokeSticker,
	updateSticker,
} from './stickers.service'

const optionalText = z
	.string()
	.optional()
	.transform(v => (v ? v : undefined))

const actionSchema = z.discriminatedUnion('intent', [
	z.object({
		intent: z.literal('activate'),
		code: z.string(),
		label: z.string(),
		linkedObject: optionalText,
	}),
	z.object({
		intent: z.literal('update'),
		code: z.string(),
		label: z.string(),
		linkedObject: optionalText,
	}),
	z.object({ intent: z.literal('revoke'), code: z.string() }),
])

export async function stickersAction({ request }: { request: Request }) {
	const session = await getServerSession(request)
	if (!session) throw redirect('/auth')

	const submission = actionSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return data({ ok: false }, { status: 400 })
	}

	try {
		switch (submission.data.intent) {
			case 'activate':
				await activateSticker(
					submission.data.code,
					{
						label: submission.data.label,
						linkedObject: submission.data.linkedObject,
					},
					request,
				)
				break
			case 'update':
				await updateSticker(
					submission.data.code,
					{
						label: submission.data.label,
						linkedObject: submission.data.linkedObject,
					},
					request,
				)
				break
			case 'revoke':
				await revokeSticker(submission.data.code, request)
				break
		}
		return { ok: true }
	} catch (err) {
		if (err instanceof ApiError && err.status === 401) throw redirect('/auth')
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false }, { status: 400 })
	}
}
