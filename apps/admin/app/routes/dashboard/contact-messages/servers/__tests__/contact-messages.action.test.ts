import { ApiError } from '@/shared/utils/api-fetch'
import type { ActionResult } from '@/shared/types/action'

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

const rootOf = (result: ActionResult<unknown>) =>
	result.success ? undefined : result.errors?.root?.message

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
		expect(await submit({ intent: 'view', id: 'msg-1' })).toEqual({
			success: true,
			data: MESSAGE,
		})
		expect(getContactMessageById).toHaveBeenCalledWith(
			'msg-1',
			expect.any(Request),
		)
	})

	// The status is the action's own decision, not the form's.
	it('archives by sending the status the API expects', async () => {
		const result = await submit({ intent: 'archive', id: 'msg-1' })

		expect(result.success).toBe(true)
		expect(updateContactMessageStatus).toHaveBeenCalledWith(
			'msg-1',
			'archived',
			expect.any(Request),
		)
	})

	// The id check runs before the intent check, so a missing id is reported as
	// such even for an intent the action would have refused anyway.
	it.each(['view', 'archive', 'supprimer', ''])(
		'names the missing id for intent %p',
		async intent => {
			expect(rootOf(await submit({ intent }))).toBe('ID manquant')
			expect(getContactMessageById).not.toHaveBeenCalled()
			expect(updateContactMessageStatus).not.toHaveBeenCalled()
		},
	)

	it('names an unknown intent', async () => {
		expect(rootOf(await submit({ intent: 'supprimer', id: 'msg-1' }))).toBe(
			'Intent inconnu',
		)
	})

	it.each([404, 403])('reports a %i as a root error', async statusCode => {
		getContactMessageById.mockRejectedValue(
			new ApiError(statusCode, 'Message introuvable'),
		)

		expect(rootOf(await submit({ intent: 'view', id: 'm' }))).toBe(
			'Message introuvable',
		)
	})

	it('sends a dead session back to the login page', async () => {
		getContactMessageById.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(submit({ intent: 'view', id: 'm' })).rejects.toBeInstanceOf(
			Response,
		)
	})

	// A connection string is not an outcome: it reaches the error boundary,
	// which React Router sanitises before the browser sees it.
	it('lets a non-API failure through', async () => {
		updateContactMessageStatus.mockRejectedValue(
			new Error('ECONNREFUSED 127.0.0.1:3002'),
		)

		await expect(submit({ intent: 'archive', id: 'm' })).rejects.toThrow(
			'ECONNREFUSED',
		)
	})
})
