import { readFileSync } from 'node:fs'
import { DISALLOWED_PATHS, INDEXABLE_PATHS } from '../seo.const'

const ROUTES = 'app/routes.ts'

function mountedRoutes(): { path: string; file: string }[] {
	const source = readFileSync(ROUTES, 'utf8')

	return [...source.matchAll(/route\(\s*'([^']+)',\s*'([^']+)'/g)].map(
		match => ({ path: `/${match[1] ?? ''}`, file: `app/${match[2] ?? ''}` }),
	)
}

const isPage = (file: string) => file.endsWith('_index.tsx')

// robots.txt stops a crawl, never an indexing, so every path named there must
// send `noindex` too — the two lists would drift apart in silence.
describe('the pages robots.txt keeps out', () => {
	const routes = mountedRoutes()

	it('finds the routes it is meant to be reading', () => {
		expect(routes.length).toBeGreaterThan(20)
	})

	it.each(DISALLOWED_PATHS)('has a page behind %s', path => {
		const under = routes.filter(route => route.path.startsWith(path))

		expect(under.length, `${path} matches no mounted route`).toBeGreaterThan(0)
	})

	it.each(DISALLOWED_PATHS)('sends noindex on every page under %s', path => {
		const offenders = routes
			.filter(route => route.path.startsWith(path) && isPage(route.file))
			.filter(route => !readFileSync(route.file, 'utf8').includes('noindex'))
			.map(route => route.path)

		expect(offenders).toEqual([])
	})

	// The other direction, which the list cannot check by itself: a private route
	// added later would otherwise be crawled with nothing to say it must not be.
	it('names in robots.txt every page that refuses the index', () => {
		const orphans = routes
			.filter(
				route =>
					isPage(route.file) &&
					readFileSync(route.file, 'utf8').includes('noindex'),
			)
			.filter(
				route => !DISALLOWED_PATHS.some(path => route.path.startsWith(path)),
			)
			.map(route => route.path)

		expect(orphans).toEqual([])
	})

	it.each(INDEXABLE_PATHS)('leaves %s indexable', path => {
		for (const route of routes.filter(
			item => item.path === path && isPage(item.file),
		)) {
			expect(readFileSync(route.file, 'utf8')).not.toContain('noindex')
		}
	})
})
