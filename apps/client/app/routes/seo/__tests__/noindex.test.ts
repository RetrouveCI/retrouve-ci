import { readFileSync } from 'node:fs'
import {
	DISALLOWED_PATHS,
	ENUMERATED_PATHS,
	INDEXABLE_PATHS,
} from '../seo.const'

const ROUTES = 'app/routes.ts'

function mountedRoutes(): { path: string; file: string }[] {
	const source = readFileSync(ROUTES, 'utf8')

	const routes = [...source.matchAll(/route\(\s*'([^']+)',\s*'([^']+)'/g)].map(
		match => ({ path: `/${match[1] ?? ''}`, file: `app/${match[2] ?? ''}` }),
	)

	// `index()` is how the homepage is mounted, and a `route(`-only scan missed
	// it: every assertion naming `/` was passing over an empty set.
	const home = [...source.matchAll(/index\(\s*'([^']+)'\s*\)/g)].map(match => ({
		path: '/',
		file: `app/${match[1] ?? ''}`,
	}))

	return [...home, ...routes]
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

// Every mounted page belongs to exactly one class, and no class names anything
// unmounted. The checks above are each one direction over one list, so two
// things slipped through: a page in none of them reached no sitemap, and a list
// entry with no page put a 404 in it — an `it.each` over a filtered set passes
// when the set is empty.
describe('the three classes a page can be in', () => {
	const pages = mountedRoutes().filter(route => isPage(route.file))
	const classify = (path: string) => ({
		indexable: INDEXABLE_PATHS.some(item => item === path),
		disallowed: DISALLOWED_PATHS.some(item => path.startsWith(item)),
		enumerated: ENUMERATED_PATHS.some(item => item === path),
	})

	it('sees the homepage, which only `index()` mounts', () => {
		expect(pages.map(page => page.path)).toContain('/')
	})

	it('puts every mounted page in exactly one of them', () => {
		const misfiled = pages
			.map(page => ({ path: page.path, ...classify(page.path) }))
			.filter(
				page =>
					Number(page.indexable) +
						Number(page.disallowed) +
						Number(page.enumerated) !==
					1,
			)

		expect(misfiled).toEqual([])
	})

	it.each([...INDEXABLE_PATHS, ...ENUMERATED_PATHS])(
		'has a mounted page behind %s',
		path => {
			expect(pages.map(page => page.path)).toContain(path)
		},
	)

	// A static path here would mean the sitemap enumerates what a list could
	// simply have named.
	it.each(ENUMERATED_PATHS)(
		'only enumerates a parameterised path (%s)',
		path => {
			expect(path).toContain(':')
		},
	)
})
