import { ApiError } from '@/shared/utils/api-fetch'
import type { ActionResult } from '@/shared/types/action'

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

const rootOf = (result: ActionResult) =>
	result.success ? undefined : result.errors?.root?.message

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

	// The badge is revalidated from the layout loader, so the action reports the
	// outcome and nothing else.
	it('marks one notification read', async () => {
		expect(await submit({ intent: 'mark-read', id: 'notif-1' })).toEqual({
			success: true,
		})
		expect(markAsRead).toHaveBeenCalledWith('notif-1', expect.any(Request))
		expect(markAllAsRead).not.toHaveBeenCalled()
	})

	it('marks everything read without needing an id', async () => {
		expect(await submit({ intent: 'mark-all-read' })).toEqual({ success: true })
		expect(markAllAsRead).toHaveBeenCalledWith(expect.any(Request))
		expect(markAsRead).not.toHaveBeenCalled()
	})

	// The debt this closes: the id sat inside the `mark-read` condition, so a
	// submission naming the right intent with no id read « Intent inconnu ».
	it('names the missing id on a mark-read that carries none', async () => {
		expect(rootOf(await submit({ intent: 'mark-read' }))).toBe('ID manquant')
		expect(markAsRead).not.toHaveBeenCalled()
	})

	it.each(['mark-unread', 'delete', ''])(
		'names an unknown intent %p',
		async intent => {
			expect(rootOf(await submit({ intent, id: 'notif-1' }))).toBe(
				'Intent inconnu',
			)
			expect(markAsRead).not.toHaveBeenCalled()
			expect(markAllAsRead).not.toHaveBeenCalled()
		},
	)

	it('reports the API message as a root error', async () => {
		markAsRead.mockRejectedValue(new ApiError(404, 'Introuvable'))

		expect(rootOf(await submit({ intent: 'mark-read', id: 'notif-1' }))).toBe(
			'Introuvable',
		)
	})

	it('sends a dead session back to the login page', async () => {
		markAsRead.mockRejectedValue(new ApiError(401, 'Unauthorized'))

		await expect(
			submit({ intent: 'mark-read', id: 'notif-1' }),
		).rejects.toBeInstanceOf(Response)
	})

	// Not an outcome but a bug: it belongs in the error boundary.
	it('lets a non-API failure through', async () => {
		markAllAsRead.mockRejectedValue(new Error('ECONNREFUSED 127.0.0.1:3002'))

		await expect(submit({ intent: 'mark-all-read' })).rejects.toThrow(
			'ECONNREFUSED',
		)
	})
})
