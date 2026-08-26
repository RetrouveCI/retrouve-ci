import { POSTS_PAGE_SIZE } from '../../helpers/parse-posts-filters'

const { getLostItems } = vi.hoisted(() => ({ getLostItems: vi.fn() }))

vi.mock('../lost-items.service', () => ({ getLostItems }))

const { postsLoader } = await import('../lost-items.loader')

const requestFor = (search = '') =>
	new Request(`http://localhost:3000/posts${search}`)

const dto = (id: string) => ({
	id,
	title: `Annonce ${id}`,
	description: 'Une description.',
	ville: 'Abidjan',
	commune: 'Cocody',
	eventDate: '2026-08-01T10:00:00.000Z',
	type: 'lost',
	category: 'bag',
	photos: [],
})

beforeEach(() => {
	getLostItems.mockReset().mockResolvedValue({
		items: [],
		total: 0,
		page: 1,
		pageSize: POSTS_PAGE_SIZE,
	})
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('postsLoader', () => {
	it('asks for the first page of the listing by default', async () => {
		await postsLoader({ request: requestFor() })

		expect(getLostItems).toHaveBeenCalledWith({
			page: 1,
			pageSize: POSTS_PAGE_SIZE,
		})
	})

	it('forwards the filters the url carries', async () => {
		await postsLoader({
			request: requestFor('?q=sac&type=lost&ville=Abidjan&page=2'),
		})

		expect(getLostItems).toHaveBeenCalledWith(
			expect.objectContaining({
				search: 'sac',
				type: 'lost',
				ville: 'Abidjan',
				page: 2,
			}),
		)
	})

	// #120: a filter the contract refuses used to answer 400 and take the page
	// down. It must be dropped, and the filters beside it must survive.
	it('drops a refused filter and keeps the rest', async () => {
		await postsLoader({ request: requestFor('?category=test&ville=Abidjan') })

		const filters = getLostItems.mock.calls[0]?.[0]
		expect(filters).not.toHaveProperty('category')
		expect(filters).toMatchObject({ ville: 'Abidjan' })
	})

	it('maps the listings the API returns', async () => {
		getLostItems.mockResolvedValue({
			items: [dto('post-1'), dto('post-2')],
			total: 2,
			page: 1,
			pageSize: POSTS_PAGE_SIZE,
		})

		const { listings } = await postsLoader({ request: requestFor() })

		expect(listings).toHaveLength(2)
		expect(listings[0]).toMatchObject({
			id: 'post-1',
			location: 'Cocody, Abidjan',
		})
	})

	// The pager reads these, so they come from the API's answer rather than from
	// what was asked for.
	it('reports the paging the API answered with', async () => {
		getLostItems.mockResolvedValue({
			items: [],
			total: 137,
			page: 3,
			pageSize: POSTS_PAGE_SIZE,
		})

		const result = await postsLoader({ request: requestFor('?page=3') })

		expect(result).toMatchObject({
			total: 137,
			page: 3,
			pageSize: POSTS_PAGE_SIZE,
		})
	})
})
