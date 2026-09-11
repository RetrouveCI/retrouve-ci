import type { ListNotificationsFilterData } from '@app/contracts/notifications'

const { requireAdminSession, listNotifications, getPushSubscriptionCount } =
	vi.hoisted(() => ({
		requireAdminSession: vi.fn(),
		listNotifications: vi.fn(),
		getPushSubscriptionCount: vi.fn(),
	}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../notifications.service', () => ({
	listNotifications,
	getPushSubscriptionCount,
}))

const { notificationsLoader } = await import('../notifications.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/notifications${search}`)

const answer = (items: unknown[], total = items.length) => ({
	items,
	total,
	page: 1,
	pageSize: 25,
})

/** The page the loader asked for, told apart from its one-row count probes. */
const pageCall = () =>
	listNotifications.mock.calls.find(
		([params]) => params.pageSize !== 1,
	)?.[0] as Partial<ListNotificationsFilterData> | undefined

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listNotifications.mockReset().mockResolvedValue(answer([]))
	getPushSubscriptionCount.mockReset().mockResolvedValue(0)
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

	it('asks the API for the first page by default', async () => {
		await notificationsLoader({ request: requestFor() })

		expect(pageCall()).toEqual({ read: undefined, page: 1, pageSize: 25 })
	})

	it('forwards the page and the size the URL carries', async () => {
		listNotifications.mockResolvedValue(answer([], 500))

		await notificationsLoader({ request: requestFor('?page=4&pageSize=100') })

		expect(pageCall()).toMatchObject({ page: 4, pageSize: 100 })
	})

	it.each([
		['?read=true', true],
		['?read=false', false],
	])('turns %s into the boolean %s', async (search, expected) => {
		await notificationsLoader({ request: requestFor(search) })

		expect(pageCall()?.read).toBe(expected)
	})

	// The contract refuses these, where the API's old DTO read them as `false`.
	it.each(['?read=oui', '?read=1', '?read='])(
		'drops the unreadable filter %s rather than guessing',
		async search => {
			await notificationsLoader({ request: requestFor(search) })

			expect(pageCall()?.read).toBeUndefined()
		},
	)

	// The two cards and the chips used to count the fifty rows on screen.
	it('counts unread and read over every notification', async () => {
		listNotifications.mockImplementation(async ({ read, pageSize }) =>
			answer([], pageSize !== 1 || read === undefined ? 10 : read ? 7 : 3),
		)

		const result = await notificationsLoader({ request: requestFor() })

		expect(result.counts).toEqual({ all: 10, unread: 3, read: 7 })
		expect(listNotifications).toHaveBeenCalledWith(
			{ read: false, page: 1, pageSize: 1 },
			expect.any(Request),
		)
	})

	it('reads the counters as absent when one cannot be served', async () => {
		listNotifications.mockImplementation(async ({ read, pageSize }) => {
			if (pageSize === 1 && read === true) throw new Error('down')
			return answer([], 3)
		})

		const result = await notificationsLoader({ request: requestFor() })

		expect(result.counts).toBeNull()
		expect(result.total).toBe(3)
	})

	it('sends a page past the end back to the last one', async () => {
		listNotifications.mockResolvedValue(answer([], 30))

		const thrown = await notificationsLoader({
			request: requestFor('?read=false&page=7'),
		}).catch((error: unknown) => error)

		expect((thrown as Response).headers.get('location')).toBe(
			'/notifications?read=false&page=2',
		)
	})

	it('returns the items and the total the service reports', async () => {
		listNotifications.mockResolvedValue(answer([{ id: 'n-1' }], 1))

		const result = await notificationsLoader({ request: requestFor() })

		expect(result.notifications).toEqual([{ id: 'n-1' }])
		expect(result.total).toBe(1)
	})

	describe('the subscribed-device figure', () => {
		it.each([0, 5])('carries %i through', async count => {
			getPushSubscriptionCount.mockResolvedValue(count)

			expect(
				(await notificationsLoader({ request: requestFor() })).pushDevices,
			).toBe(count)
		})

		// A figure must never take the page down; the card then shows a dash
		// rather than announcing a zero nobody measured.
		it('answers null when the counter cannot be reached', async () => {
			getPushSubscriptionCount.mockRejectedValue(new Error('down'))

			expect(
				(await notificationsLoader({ request: requestFor() })).pushDevices,
			).toBeNull()
		})
	})
})
