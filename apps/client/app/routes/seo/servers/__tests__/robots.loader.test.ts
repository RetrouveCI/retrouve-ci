import { DISALLOWED_PATHS } from '../../seo.const'
import { buildRobots, loader } from '../robots.loader'

const ORIGIN = 'https://retrouveci.com'

describe('robots.txt', () => {
	const body = buildRobots(ORIGIN)

	it('opens the site, then names what stays out', () => {
		expect(body).toContain('User-agent: *')
		expect(body).toContain('Allow: /')
	})

	it.each(DISALLOWED_PATHS)('keeps crawlers off %s', path => {
		expect(body).toContain(`Disallow: ${path}`)
	})

	it('points at the sitemap on the origin it was asked from', () => {
		expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
	})

	it('leaves the browsable pages alone', () => {
		for (const path of ['/posts', '/publish\n', '/stickers', '/about']) {
			expect(body).not.toContain(`Disallow: ${path}`)
		}
	})

	it('is served as plain text, and cached', async () => {
		const response = loader({
			request: new Request('http://localhost:3000/robots.txt', {
				headers: { origin: ORIGIN },
			}),
		})

		expect(response.headers.get('Content-Type')).toContain('text/plain')
		expect(response.headers.get('Cache-Control')).toContain('max-age')
		expect(await response.text()).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`)
	})
})
