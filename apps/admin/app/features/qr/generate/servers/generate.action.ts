import { data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { ApiError } from '@/shared/lib/api-client'
import { generateQrTokens } from '../../servers/qr.service'
import { generateQrSchema } from '../generate.schema'

export async function generateQrAction({ request }: { request: Request }) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: generateQrSchema })

	if (submission.status !== 'success') {
		return data({ ok: false, submission: submission.reply() }, { status: 400 })
	}

	const { count, batch } = submission.value

	try {
		const tokens = await generateQrTokens(count, batch, request)
		return { ok: true, tokens, count }
	} catch (err) {
		if (err instanceof ApiError) {
			return data({ ok: false, error: err.message }, { status: err.status })
		}
		return data({ ok: false, error: 'Erreur serveur' }, { status: 500 })
	}
}
