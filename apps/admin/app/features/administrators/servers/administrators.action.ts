import { data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { adminFormSchema } from '../administrators.schema'
import type { Admin, AdminRole, AdminStatus } from '../administrators.types'

export async function administratorsAction({ request }: { request: Request }) {
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')

	if (intent === 'create') {
		const submission = parseWithZod(formData, { schema: adminFormSchema })
		if (submission.status !== 'success') {
			return data(
				{ ok: false, submission: submission.reply() },
				{ status: 400 },
			)
		}

		const admin: Admin = {
			id: `a-${Date.now()}`,
			...submission.value,
			role: submission.value.role as AdminRole,
			status: 'active',
			createdAt: new Date().toISOString(),
			lastLogin: null,
		}

		return { ok: true, admin, intent }
	}

	if (intent === 'update') {
		const submission = parseWithZod(formData, { schema: adminFormSchema })

		if (submission.status !== 'success') {
			return data(
				{ ok: false, submission: submission.reply() },
				{ status: 400 },
			)
		}

		return {
			ok: true,
			id: String(formData.get('id') ?? ''),
			updates: submission.value,
			intent,
		}
	}

	if (intent === 'toggle-status') {
		const id = String(formData.get('id') ?? '')
		const status = String(formData.get('status') ?? '') as AdminStatus
		return { ok: true, id, status, intent }
	}

	if (intent === 'delete') {
		const id = String(formData.get('id') ?? '')
		return { ok: true, id, intent }
	}

	if (intent === 'reset-password') {
		return { ok: true, intent }
	}

	return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
}
