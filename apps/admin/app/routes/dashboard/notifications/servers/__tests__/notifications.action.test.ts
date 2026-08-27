import { ApiError } from '@/shared/utils/api-fetch'

const { requireAdminSession, markAsRead, markAllAsRead } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	markAsRead: vi.fn(),
	markAllAsRead: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../notifications.service', () => ({ markAsRead, markAllAsRead }))

const { notificationsAction } = await import('../notifications.action')

const NOTIFICATION = { id: 'notif-1', read: true }

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return notificationsAction({
		request: new Request('http://localhost:3001/notifications', {
			method: 'POST',
			body,
		}),
	})
}

/** The action answers `data(...)` on refusal, a plain object on success. */
function bodyOf(result: unknown) {
	const asData = result as { data?: unknown; init?: { status?: number } }
	return {
		body: (asData.data ?? result) as { ok: boolean; error?: string },
		status: asData.init?.status,
	}
}

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	markAsRead.mockReset().mockResolvedValue(NOTIFICATION)
	markAllAsRead.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('notificationsAction', () => {
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(submit({ intent: 'mark-all-read' })).rejects.toBeInstanceOf(
			Response,
		)
		expect(markAllAsRead).not.toHaveBeenCalled()
	})

	// The badge is revalidated from the layout loader, so the action echoes the
	// intent rather than a count.
	it('marks one notification read and echoes the intent', async () => {
		const { body } = bodyOf(
			await submit({ intent: 'mark-read', id: 'notif-1' }),
		)

		expect(body).toEqual({
			ok: true,
			notification: NOTIFICATION,
			intent: 'mark-read',
		})
		expect(markAsRead).toHaveBeenCalledWith('notif-1', expect.any(Request))
		expect(markAllAsRead).not.toHaveBeenCalled()
	})

	it('marks everything read without needing an id', async () => {
		const { body } = bodyOf(await submit({ intent: 'mark-all-read' }))

		expect(body).toEqual({ ok: true, intent: 'mark-all-read' })
		expect(markAllAsRead).toHaveBeenCalledWith(expect.any(Request))
		expect(markAsRead).not.toHaveBeenCalled()
	})

	/**
	 * Current behaviour, asserted rather than implied: the id is part of the
	 * `mark-read` condition, so a submission that names the right intent with no
	 * id is reported as an **unknown intent**, which names the wrong problem.
	 * Unlike the other admin actions, this one has no `ID manquant` branch.
	 */
	it('reports a mark-read with no id as an unknown intent', async () => {
		const { body, status } = bodyOf(await submit({ intent: 'mark-read' }))

		expect(status).toBe(400)
		expect(body).toEqual({ ok: false, error: 'Intent inconnu' })
		expect(markAsRead).not.toHaveBeenCalled()
	})

	it.each(['mark-unread', 'delete', ''])(
		'answers 400 for intent %p',
		async intent => {
			const { body, status } = bodyOf(await submit({ intent, id: 'notif-1' }))

			expect(status).toBe(400)
			expect(body).toEqual({ ok: false, error: 'Intent inconnu' })
			expect(markAsRead).not.toHaveBeenCalled()
			expect(markAllAsRead).not.toHaveBeenCalled()
		},
	)

	it.each([404, 401])(
		'passes the API message and status through on a %i',
		async statusCode => {
			markAsRead.mockRejectedValue(new ApiError(statusCode, 'Introuvable'))

			const { body, status } = bodyOf(
				await submit({ intent: 'mark-read', id: 'notif-1' }),
			)

			expect(status).toBe(statusCode)
			expect(body).toEqual({ ok: false, error: 'Introuvable' })
		},
	)

	it('answers a generic 500 for anything that is not an ApiError', async () => {
		markAllAsRead.mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:3002'))

		const { body, status } = bodyOf(await submit({ intent: 'mark-all-read' }))

		expect(status).toBe(500)
		expect(body).toEqual({ ok: false, error: 'Erreur serveur' })
	})
})
