import { data } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { requireAdminSession } from '@/shared/auth/auth.server'
import {
	adminCreateSchema,
	adminUpdateRoleSchema,
} from '../administrators.schema'
import {
	createAdminUser,
	setAdminRole,
	banAdminUser,
	unbanAdminUser,
	removeAdminUser,
	sendPasswordReset,
} from './administrators.service'

export async function administratorsAction({ request }: { request: Request }) {
	await requireAdminSession(request)

	const cookie = request.headers.get('cookie') ?? ''
	const origin = request.headers.get('origin') ?? ''
	const headers = { cookie, origin }
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')

	if (intent === 'create') {
		const submission = parseWithZod(formData, { schema: adminCreateSchema })
		if (submission.status !== 'success') {
			return data(
				{ ok: false, submission: submission.reply() },
				{ status: 400 },
			)
		}

		try {
			await createAdminUser(headers, {
				name: submission.value.name,
				email: submission.value.email,
				password: submission.value.password,
				role: submission.value.role,
				phone: submission.value.phone,
			})
			return { ok: true, intent }
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Erreur lors de la création'
			return data({ ok: false, error: message }, { status: 400 })
		}
	}

	if (intent === 'update') {
		const submission = parseWithZod(formData, { schema: adminUpdateRoleSchema })
		if (submission.status !== 'success') {
			return data(
				{ ok: false, submission: submission.reply() },
				{ status: 400 },
			)
		}

		const userId = String(formData.get('id') ?? '')
		try {
			await setAdminRole(headers, userId, submission.value.role)
			return { ok: true, intent }
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
			return data({ ok: false, error: message }, { status: 400 })
		}
	}

	if (intent === 'toggle-status') {
		const userId = String(formData.get('id') ?? '')
		const newStatus = String(formData.get('status') ?? '')
		try {
			if (newStatus === 'inactive') {
				await banAdminUser(headers, userId)
			} else {
				await unbanAdminUser(headers, userId)
			}
			return { ok: true, intent, status: newStatus }
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: 'Erreur lors du changement de statut'
			return data({ ok: false, error: message }, { status: 400 })
		}
	}

	if (intent === 'delete') {
		const userId = String(formData.get('id') ?? '')
		try {
			await removeAdminUser(headers, userId)
			return { ok: true, intent }
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Erreur lors de la suppression'
			return data({ ok: false, error: message }, { status: 400 })
		}
	}

	if (intent === 'reset-password') {
		const email = String(formData.get('email') ?? '')
		try {
			await sendPasswordReset(headers, email)
			return { ok: true, intent }
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Erreur lors de l'envoi"
			return data({ ok: false, error: message }, { status: 400 })
		}
	}

	return data({ ok: false, error: 'Intent inconnu' }, { status: 400 })
}
