import { LOST_ITEM_CATEGORIES } from '@app/contracts/lost-items'

const { findMatchingLostItems } = vi.hoisted(() => ({
	findMatchingLostItems: vi.fn(),
}))

vi.mock('../matching.service', () => ({ findMatchingLostItems }))

const { loader } = await import('../matching.loader')

const requestFor = (search: string) =>
	new Request(`http://localhost:3000/publish/matches${search}`)

const VALID = `?type=lost&category=${LOST_ITEM_CATEGORIES[0]}&ville=Abidjan`

beforeEach(() => {
	findMatchingLostItems.mockReset().mockResolvedValue([])
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('the matching loader', () => {
	it('asks the API for the three criteria it was given', async () => {
		await loader({ request: requestFor(VALID) })

		expect(findMatchingLostItems).toHaveBeenCalledWith({
			type: 'lost',
			category: LOST_ITEM_CATEGORIES[0],
			ville: 'Abidjan',
		})
	})

	// The panel loads while the form is still being filled in, so a partial query
	// is the normal case, not an error.
	it.each([
		['nothing', ''],
		['no ville', `?type=lost&category=${LOST_ITEM_CATEGORIES[0]}`],
		['an empty ville', `?type=lost&category=${LOST_ITEM_CATEGORIES[0]}&ville=`],
		['no category', '?type=lost&ville=Abidjan'],
		['an unknown category', '?type=lost&category=nawak&ville=Abidjan'],
		[
			'an unknown type',
			`?type=nawak&category=${LOST_ITEM_CATEGORIES[0]}&ville=Abidjan`,
		],
	])(
		'answers with no match for %s, and reads nothing',
		async (_label, search) => {
			expect(await loader({ request: requestFor(search) })).toEqual({
				items: [],
			})
			expect(findMatchingLostItems).not.toHaveBeenCalled()
		},
	)

	it('maps what the API returns', async () => {
		findMatchingLostItems.mockResolvedValue([
			{
				id: 'post-1',
				title: 'Sac noir',
				ville: 'Abidjan',
				commune: 'Cocody',
				eventDate: '2026-08-01T10:00:00.000Z',
				photos: [],
			},
		])

		const { items } = await loader({ request: requestFor(VALID) })

		expect(items).toHaveLength(1)
		expect(items[0]).toMatchObject({
			id: 'post-1',
			title: 'Sac noir',
			location: 'Cocody, Abidjan',
			dateISO: '2026-08-01',
		})
	})
})
