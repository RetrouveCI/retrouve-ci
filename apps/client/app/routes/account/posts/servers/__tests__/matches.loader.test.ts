import type { MatchCandidateApiDto } from '@/shared/types/lost-items.types'

const { requireServerSession, getListingMatches } = vi.hoisted(() => ({
	requireServerSession: vi.fn(),
	getListingMatches: vi.fn(),
}))

vi.mock('@/shared/helpers/session.server', () => ({ requireServerSession }))
vi.mock('../matches.service', () => ({ getListingMatches }))

const { loader } = await import('../matches.loader')

const request = (query = '') =>
	new Request(`http://localhost:3000/account/posts/matches${query}`)

const candidate = (id: string, ville = 'Cocody'): MatchCandidateApiDto => ({
	score: 65,
	lostItem: {
		id,
		title: `Objet ${id}`,
		description: 'Ramassé sur le trottoir.',
		ville,
		commune: null,
		eventDate: '2026-08-01T10:00:00.000Z',
		contactName: 'Awa',
		contactWhatsapp: '+2250700000000',
		type: 'found',
		category: 'bag',
		photos: [],
		resolutionStatus: 'active',
		moderationStatus: 'published',
		createdAt: '2026-08-01T09:00:00.000Z',
		views: 0,
		contactsCount: 0,
	},
})

beforeEach(() => {
	requireServerSession.mockReset().mockResolvedValue({ user: { id: 'u1' } })
	getListingMatches.mockReset().mockResolvedValue([])
})

describe('matches loader', () => {
	it('gates on the session before asking anything', async () => {
		requireServerSession.mockRejectedValue(new Response(null, { status: 302 }))

		await expect(loader({ request: request('?ids=a') })).rejects.toBeDefined()
		expect(getListingMatches).not.toHaveBeenCalled()
	})

	it('asks nothing when no id is given', async () => {
		expect(await loader({ request: request() })).toEqual({ matches: {} })
		expect(getListingMatches).not.toHaveBeenCalled()
	})

	it('asks once per id and keys the answers by listing', async () => {
		getListingMatches.mockImplementation((id: string) =>
			id === 'a' ? [candidate('m1')] : [],
		)

		const { matches } = await loader({ request: request('?ids=a,b') })

		expect(getListingMatches).toHaveBeenCalledTimes(2)
		expect(Object.keys(matches)).toEqual(['a'])
		expect(matches.a.count).toBe(1)
		expect(matches.a.items[0]).toMatchObject({ id: 'm1', ville: 'Cocody' })
	})

	it('counts everything the endpoint found but lists at most four', async () => {
		getListingMatches.mockResolvedValue(
			Array.from({ length: 7 }, (_, i) => candidate(`m${i}`)),
		)

		const { matches } = await loader({ request: request('?ids=a') })

		expect(matches.a.count).toBe(7)
		expect(matches.a.items).toHaveLength(4)
	})

	/** A card without a band is complete: a failure must not take the list down. */
	it('drops a listing whose matches could not be read', async () => {
		getListingMatches.mockRejectedValue(new Error('boom'))

		expect(await loader({ request: request('?ids=a') })).toEqual({
			matches: {},
		})
	})

	it('asks once for a repeated id', async () => {
		await loader({ request: request('?ids=a,a,a') })

		expect(getListingMatches).toHaveBeenCalledTimes(1)
	})

	it('never asks beyond one page of listings', async () => {
		const ids = Array.from({ length: 30 }, (_, i) => `id-${i}`).join(',')

		await loader({ request: request(`?ids=${ids}`) })

		expect(getListingMatches).toHaveBeenCalledTimes(12)
	})
})
