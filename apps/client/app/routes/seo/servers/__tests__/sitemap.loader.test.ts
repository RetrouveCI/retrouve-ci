const { getLostItems } = vi.hoisted(() => ({ getLostItems: vi.fn() }))

vi.mock('../../../posts/servers/lost-items.service', () => ({ getLostItems }))

const { buildSitemap, loader } = await import('../sitemap.loader')
const { INDEXABLE_PATHS, SITEMAP_MAX_PAGES, SITEMAP_PAGE_SIZE } =
	await import('../../seo.const')

const ORIGIN = 'https://retrouveci.com'

const listing = (id: string) => ({
	id,
	createdAt: '2026-08-01T10:00:00.000Z',
})

const fetchSitemap = () =>
	loader({
		request: new Request('http://localhost:3000/sitemap.xml', {
			headers: { origin: ORIGIN },
		}),
	})

beforeEach(() => {
	getLostItems.mockReset().mockResolvedValue({ items: [], total: 0 })
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('buildSitemap', () => {
	it('writes absolute locations under the origin', () => {
		const xml = buildSitemap(ORIGIN, [{ path: '/posts' }])

		expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
		expect(xml).toContain(`<loc>${ORIGIN}/posts</loc>`)
	})

	it('trims a timestamp to its day', () => {
		const xml = buildSitemap(ORIGIN, [
			{ path: '/posts/1', lastModified: '2026-08-01T10:00:00.000Z' },
		])

		expect(xml).toContain('<lastmod>2026-08-01</lastmod>')
	})

	it('omits lastmod when nothing dates the page', () => {
		expect(buildSitemap(ORIGIN, [{ path: '/' }])).not.toContain('lastmod')
	})

	it('escapes what would otherwise break the document', () => {
		const xml = buildSitemap(ORIGIN, [{ path: '/posts/a&b<c' }])

		expect(xml).toContain('/posts/a&amp;b&lt;c')
		expect(xml).not.toContain('a&b<c')
	})
})

describe('the sitemap', () => {
	it('names every indexable page', async () => {
		const xml = await (await fetchSitemap()).text()

		for (const path of INDEXABLE_PATHS) {
			expect(xml, path).toContain(`<loc>${ORIGIN}${path}</loc>`)
		}
	})

	it('names every published listing', async () => {
		getLostItems.mockResolvedValue({
			items: [listing('abc'), listing('def')],
			total: 2,
		})

		const xml = await (await fetchSitemap()).text()

		expect(xml).toContain(`<loc>${ORIGIN}/posts/abc</loc>`)
		expect(xml).toContain(`<loc>${ORIGIN}/posts/def</loc>`)
	})

	it('reads full pages, and stops once it holds them all', async () => {
		getLostItems.mockResolvedValue({ items: [listing('abc')], total: 1 })

		await fetchSitemap()

		expect(getLostItems).toHaveBeenCalledTimes(1)
		expect(getLostItems).toHaveBeenCalledWith(
			{ page: 1, pageSize: SITEMAP_PAGE_SIZE },
			expect.any(Request),
		)
	})

	it('never reads past its cap', async () => {
		getLostItems.mockResolvedValue({ items: [listing('abc')], total: 100_000 })

		await fetchSitemap()

		expect(getLostItems).toHaveBeenCalledTimes(SITEMAP_MAX_PAGES)
	})

	it('stops on an empty page rather than looping to the cap', async () => {
		getLostItems
			.mockResolvedValueOnce({ items: [listing('abc')], total: 100_000 })
			.mockResolvedValue({ items: [], total: 100_000 })

		await fetchSitemap()

		expect(getLostItems).toHaveBeenCalledTimes(2)
	})

	it('keeps the static pages when the API is unreachable', async () => {
		getLostItems.mockRejectedValue(new Error('api down'))

		const response = await fetchSitemap()
		const xml = await response.text()

		expect(response.status).toBe(200)
		expect(xml).toContain(`<loc>${ORIGIN}/posts</loc>`)
		expect(xml).not.toContain('/posts/')
	})

	it('is served as xml, and cached', async () => {
		const response = await fetchSitemap()

		expect(response.headers.get('Content-Type')).toContain('application/xml')
		expect(response.headers.get('Cache-Control')).toContain('max-age')
	})
})

// The mocks must hoist above the import under test, so it is loaded with
// `await import` — which needs this file to be a module (TS1375).
export {}
