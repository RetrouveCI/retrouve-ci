import type { ListNotificationsFilterData } from '@app/contracts/notifications'

const { requireAdminSession, listNotifications } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listNotifications: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../notifications.service', () => ({ listNotifications }))

const { notificationsLoader } = await import('../notifications.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/notifications${search}`)

const readSent = () =>
	(
		listNotifications.mock.calls[0]?.[0] as Pick<
			ListNotificationsFilterData,
			'read'
		>
	).read

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listNotifications.mockReset().mockResolvedValue({ items: [], total: 0 })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('notificationsLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await notificationsLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(notificationsLoader({ request: requestFor() })).rejects.toBe(
			redirect,
		)
		expect(listNotifications).not.toHaveBeenCalled()
	})

	it.each([
		['?read=true', true],
		['?read=false', false],
	])('turns %s into the boolean %s', async (search, expected) => {
		await notificationsLoader({ request: requestFor(search) })

		expect(readSent()).toBe(expected)
	})

	// No filter means every notification, not the unread ones.
	it('sends no filter when the query string omits read', async () => {
		await notificationsLoader({ request: requestFor() })

		expect(readSent()).toBeUndefined()
	})

	// The contract refuses these, where the API's old DTO read them as `false`.
	it.each(['?read=oui', '?read=1', '?read='])(
		'drops the unreadable filter %s rather than guessing',
		async search => {
			await notificationsLoader({ request: requestFor(search) })

			expect(readSent()).toBeUndefined()
		},
	)

	it('reports the raw value to the select, all when there is none', async () => {
		expect(
			(await notificationsLoader({ request: requestFor('?read=true') }))
				.readFilter,
		).toBe('true')
		expect(
			(await notificationsLoader({ request: requestFor() })).readFilter,
		).toBe('all')
	})

	it('returns the items and the total the service reports', async () => {
		listNotifications.mockResolvedValue({ items: [{ id: 'n-1' }], total: 1 })

		const result = await notificationsLoader({ request: requestFor() })

		expect(result.notifications).toEqual([{ id: 'n-1' }])
		expect(result.total).toBe(1)
	})
})
