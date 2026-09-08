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

	it.each(INDEXABLE_PATHS)('is linked to from somewhere (%s)', path => {
		const targets = [`'${path}'`, `"${path}"`, `\`${path}\``]
		const linking = markup.filter(source =>
			targets.some(target => source.includes(target)),
		)

		expect(linking.length).toBeGreaterThan(0)
	})
})
