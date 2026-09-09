import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'app'
const ROUTES = join(APP, 'routes.ts')

// No component means no error boundary, so a GET a resource route cannot answer
// is served as a `400` JSON page. Measured on `posts/:id/contact`.

const MODULE = /'(routes\/[^']*\/servers\/[^']*\.ts)'/g
const EXPORTS_LOADER =
	/export\s+(?:async\s+)?(?:function\s+loader\b|const\s+loader\b)/

function resourceRoutes(): string[] {
	const source = readFileSync(ROUTES, 'utf8')

	return [...source.matchAll(MODULE)].map(match => match[1])
}

function answersGet(module: string): boolean {
	return EXPORTS_LOADER.test(readFileSync(join(APP, module), 'utf8'))
}

describe('every resource route answers a GET', () => {
	it('finds the routes it is meant to be reading', () => {
		const found = resourceRoutes()

		expect(found.length).toBeGreaterThanOrEqual(6)
		expect(found).toContain('routes/posts/details/servers/contact.action.ts')
		expect(found).toContain('routes/q/servers/qr-reach.action.ts')
	})

	it('leaves none without a loader', () => {
		const offenders = resourceRoutes().filter(module => !answersGet(module))

		expect(offenders).toEqual([])
	})
})
