import { ApiError } from '@/shared/utils/api-fetch'

const {
	requireAdminSession,
	getContactMessageById,
	updateContactMessageStatus,
} = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	getContactMessageById: vi.fn(),
	updateContactMessageStatus: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../contact-messages.service', () => ({
	getContactMessageById,
	updateContactMessageStatus,
}))

const { contactMessagesAction } = await import('../contact-messages.action')

const MESSAGE = { id: 'msg-1', subject: 'Sticker QR — Mes clés' }

function submit(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)

	return contactMessagesAction({
		request: new Request('http://localhost:3001/contact-messages', {
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
	getContactMessageById.mockReset().mockResolvedValue(MESSAGE)
	updateContactMessageStatus
		.mockReset()
		.mockResolvedValue({ ...MESSAGE, status: 'archived' })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('contactMessagesAction', () => {
	it('gates on the admin session before doing anything', async () => {
		requireAdminSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(
			submit({ intent: 'view', id: 'msg-1' }),
		).rejects.toBeInstanceOf(Response)
		expect(getContactMessageById).not.toHaveBeenCalled()
	})

	it('reads one message on view', async () => {
		const { body } = bodyOf(await submit({ intent: 'view', id: 'msg-1' }))

		expect(body).toEqual({ ok: true, message: MESSAGE })
		expect(getContactMessageById).toHaveBeenCalledWith(
			'msg-1',
			expect.any(Request),
		)
	})

	// The status is the action's own decision, not the form's.
	it('archives by sending the status the API expects', async () => {
		const { body } = bodyOf(await submit({ intent: 'archive', id: 'msg-1' }))

		expect(body.ok).toBe(true)
		expect(updateContactMessageStatus).toHaveBeenCalledWith(
			'msg-1',
			'archived',
			expect.any(Request),
		)
	})

	// The id check runs before the intent check, so a missing id is reported as
	// such even for an intent the action would have refused anyway.
	it.each(['view', 'archive', 'supprimer', ''])(
		'answers 400 for intent %p with no id',
		async intent => {
			const { body, status } = bodyOf(await submit({ intent }))

			expect(status).toBe(400)
			expect(body).toEqual({ ok: false, error: 'ID manquant' })
			expect(getContactMessageById).not.toHaveBeenCalled()
			expect(updateContactMessageStatus).not.toHaveBeenCalled()
		},
	)

	it('answers 400 for an unknown intent', async () => {
		const { body, status } = bodyOf(
			await submit({ intent: 'supprimer', id: 'msg-1' }),
		)

		expect(status).toBe(400)
		expect(body).toEqual({ ok: false, error: 'Intent inconnu' })
	})

	it.each([404, 403, 401])(
		'passes the API message and status through on a %i',
		async statusCode => {
			getContactMessageById.mockRejectedValue(
				new ApiError(statusCode, 'Message introuvable'),
			)

			const { body, status } = bodyOf(await submit({ intent: 'view', id: 'm' }))

			expect(status).toBe(statusCode)
			expect(body).toEqual({ ok: false, error: 'Message introuvable' })
		},
	)

	// A non-API failure must not leak a connection string to the browser.
	it('answers a generic 500 for anything that is not an ApiError', async () => {
		updateContactMessageStatus.mockRejectedValue(
			new Error('ECONNREFUSED 127.0.0.1:3002'),
		)

		const { body, status } = bodyOf(
			await submit({ intent: 'archive', id: 'm' }),
		)

		expect(status).toBe(500)
		expect(body).toEqual({ ok: false, error: 'Erreur serveur' })
	})
})
