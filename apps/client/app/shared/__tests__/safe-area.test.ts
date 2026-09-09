import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const APP = join(process.cwd(), 'app')
const STYLES = join(APP, 'app.css')
const EDGES = ['top', 'right', 'bottom', 'left'] as const

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		// A spec naming the pattern is not a screen reading it.
		if (entry.isDirectory())
			return entry.name === '__tests__' ? [] : sources(path)
		return /\.(tsx?|css)$/.test(entry.name) ? [path] : []
	})
}

describe('the device safe areas', () => {
	// One reading point is the point: a forgotten edge is then a missing class,
	// not an `env()` nobody thought to write.
	it('are read in app.css and nowhere else', () => {
		const offenders = sources(APP)
			.filter(path => path !== STYLES)
			.filter(path =>
				readFileSync(path, 'utf8').includes('env(safe-area-inset'),
			)

		expect(offenders).toEqual([])
	})

	it.each(EDGES)('names --safe-%s over its own env()', edge => {
		expect(readFileSync(STYLES, 'utf8')).toContain(
			`--safe-${edge}: env(safe-area-inset-${edge}, 0px);`,
		)
	})
})
