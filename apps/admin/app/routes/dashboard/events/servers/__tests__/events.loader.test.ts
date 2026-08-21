import type { EventStatus } from '@app/contracts/events'

const { requireAdminSession, listEvents } = vi.hoisted(() => ({
	requireAdminSession: vi.fn(),
	listEvents: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireAdminSession }))
vi.mock('../events.service', () => ({ listEvents }))

const { eventsLoader } = await import('../events.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3001/events${search}`)

beforeEach(() => {
	requireAdminSession.mockReset().mockResolvedValue(undefined)
	listEvents.mockReset().mockResolvedValue({ items: [], total: 0 })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('eventsLoader', () => {
	it('gates on the admin session before reading anything', async () => {
		const request = requestFor()

		await eventsLoader({ request })

		expect(requireAdminSession).toHaveBeenCalledWith(request)
		expect(listEvents).toHaveBeenCalledWith({ status: undefined }, request)
	})

	it('does not read the list when the session is refused', async () => {
		const redirect = new Response(null, { status: 302 })
		requireAdminSession.mockRejectedValue(redirect)

		await expect(eventsLoader({ request: requestFor() })).rejects.toBe(redirect)
		expect(listEvents).not.toHaveBeenCalled()
	})

	it.each<EventStatus>(['draft', 'published', 'cancelled'])(
		'forwards the %s filter the contract recognises',
		async status => {
			const result = await eventsLoader({
				request: requestFor(`?status=${status}`),
			})

			expect(listEvents).toHaveBeenCalledWith({ status }, expect.any(Request))
			expect(result.statusFilter).toBe(status)
		},
	)

	// A hand-typed query string must not reach the API as a filter it cannot read.
	it('drops a status the contract refuses, and still reports it to the select', async () => {
		const result = await eventsLoader({ request: requestFor('?status=vole') })

		expect(listEvents).toHaveBeenCalledWith(
			{ status: undefined },
			expect.any(Request),
		)
		expect(result.statusFilter).toBe('vole')
	})

	it('reports no filter as all', async () => {
		expect((await eventsLoader({ request: requestFor() })).statusFilter).toBe(
			'all',
		)
	})

	it('returns the items and the total the service reports', async () => {
		listEvents.mockResolvedValue({ items: [{ id: 'evt-1' }], total: 1 })

		const result = await eventsLoader({ request: requestFor() })

		expect(result.events).toEqual([{ id: 'evt-1' }])
		expect(result.total).toBe(1)
	})
})
