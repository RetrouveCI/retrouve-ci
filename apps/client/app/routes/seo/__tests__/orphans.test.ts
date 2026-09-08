import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { INDEXABLE_PATHS } from '../seo.const'

/** Where the app's own markup lives — the sitemap's own file cannot count. */
const SOURCE = 'app'
const EXCLUDED = ['__tests__', 'seo.const.ts']

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)

		if (EXCLUDED.some(name => path.includes(name))) return []
		if (entry.isDirectory()) return sources(path)

		return /\.tsx?$/.test(entry.name) ? [path] : []
	})
}

// R49 stated this and guarded nothing: a sitemap gets a page crawled, a link is
// what makes it worth ranking. A path in `INDEXABLE_PATHS` and nowhere else is
// reachable by a crawler and by no visitor.
describe('the pages the sitemap offers', () => {
	const files = sources(SOURCE)
	const markup = files.map(file => readFileSync(file, 'utf8'))

	it('finds the files it is meant to be reading', () => {
		expect(files.length).toBeGreaterThan(100)
	})

	/**
	 * ⚠️ The path has to be **terminated**, not merely present: a closing quote,
	 * or a query string or hash before it. A6 put `?from=` on five links and the
	 * old closed-literal match called the route an orphan; matching a bare prefix
	 * instead would let `/stickers/orders` vouch for `/stickers/order`.
	 */
	it.each(INDEXABLE_PATHS)('is linked to from somewhere (%s)', path => {
		const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const linked = new RegExp(`['"\`]${escaped}(?=['"\`?#])`)
		const linking = markup.filter(source => linked.test(source))

		expect(linking.length).toBeGreaterThan(0)
	})
})
