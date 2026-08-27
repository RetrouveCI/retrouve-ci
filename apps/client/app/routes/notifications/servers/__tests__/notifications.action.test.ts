import { ApiError } from '@/shared/utils/api-fetch'

const { getServerSession, markNotificationAsRead, markAllNotificationsAsRead } =
	vi.hoisted(() => ({
		getServerSession: vi.fn(),
		markNotificationAsRead: vi.fn(),
		markAllNotificationsAsRead: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ getServerSession }))
vi.mock('../notifications.service', () => ({
	markNotificationAsRead,
	markAllNotificationsAsRead,
}))

const { action } = await import('../notifications.action')

function requestFor(fields: Record<string, string>) {
	const body = new FormData()
	for (const [key, value] of Object.entries(fields)) body.append(key, value)
	return new Request('http://localhost:3000/notifications', {
		method: 'POST',
		body,
	})
}

const redirectTo = (value: unknown) =>
	value instanceof Response ? value.headers.get('location') : null

beforeEach(() => {
	getServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	markNotificationAsRead.mockReset().mockResolvedValue(undefined)
	markAllNotificationsAsRead.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the notifications action', () => {
	it('sends an anonymous visitor to the login page, marking nothing', async () => {
		getServerSession.mockResolvedValue(null)

		const thrown = await action({
			request: requestFor({ intent: 'mark-all-read' }),
		}).catch((error: unknown) => error)

		expect(redirectTo(thrown)).toBe('/auth/login')
		expect(markAllNotificationsAsRead).not.toHaveBeenCalled()
	})

	it('marks one notification as read', async () => {
		const result = await action({
			request: requestFor({ intent: 'mark-read', id: 'notif-1' }),
		})

		expect(result).toEqual({ success: true })
		expect(markNotificationAsRead).toHaveBeenCalledWith(
			'notif-1',
			expect.any(Request),
		)
		expect(markAllNotificationsAsRead).not.toHaveBeenCalled()
	})

	it('marks every notification as read', async () => {
		const result = await action({
			request: requestFor({ intent: 'mark-all-read' }),
		})

		expect(result).toEqual({ success: true })
		expect(markAllNotificationsAsRead).toHaveBeenCalledWith(expect.any(Request))
		expect(markNotificationAsRead).not.toHaveBeenCalled()
	})

	// Without an id there is nothing to mark, and marking everything instead
	// would be the worst possible guess.
	it('refuses mark-read with no id, and marks nothing at all', async () => {
		const result = await action({
			request: requestFor({ intent: 'mark-read' }),
		})

		expect(result.success).toBe(false)
		expect(markNotificationAsRead).not.toHaveBeenCalled()
		expect(markAllNotificationsAsRead).not.toHaveBeenCalled()
	})

	it.each(['', 'burn', 'mark-all'])(
		'refuses the unknown intent %p',
		async intent => {
			const result = await action({ request: requestFor({ intent }) })

			expect(result.success).toBe(false)
			expect(markNotificationAsRead).not.toHaveBeenCalled()
			expect(markAllNotificationsAsRead).not.toHaveBeenCalled()
		},
	)

	// The badge is furniture; a failure belongs on the panel, not on the route.
	it('reports an API refusal as a root error', async () => {
		markAllNotificationsAsRead.mockRejectedValue(new ApiError(500, 'Panne'))

		const result = await action({
			request: requestFor({ intent: 'mark-all-read' }),
		})

		expect(result).toEqual({
			success: false,
			errors: { root: { type: 'custom', message: 'Panne' } },
		})
	})

	it('redirects when the API answers 401', async () => {
		markAllNotificationsAsRead.mockRejectedValue(new ApiError(401, 'Expirée'))

		const thrown = await action({
			request: requestFor({ intent: 'mark-all-read' }),
		}).catch((error: unknown) => error)

		expect(redirectTo(thrown)).toBe('/auth/login')
	})
})
