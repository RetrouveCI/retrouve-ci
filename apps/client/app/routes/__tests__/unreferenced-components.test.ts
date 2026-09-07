import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const APP = 'app'

/**
 * Dead components on disk were listed as debt three passations in a row, and
 * cleared by hand each time. The rule instead: a component is reachable, or it
 * says in writing that it is kept unreferenced and why. `payment-step` is the
 * second shape of the same thing — its body is commented out (R17).
 */
const MARKER = 'unreferenced'

/** Route modules are reached by path, so `routes.ts` is their only reference. */
const REACHED_BY_PATH = /(?:^|\/)(?:_index|layout|root|entry\.[a-z.]+)\.tsx$/

const PARKED = [
	'routes/download/components/bento-features.tsx',
	'routes/download/components/download-cta.tsx',
	'routes/download/components/download-hero.tsx',
	'routes/download/components/how-it-works-steps.tsx',
	'routes/stickers/order/components/payment-step.tsx',
]

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory())
			return entry.name === '__tests__' ? [] : sources(path)
		return /\.tsx?$/.test(entry.name) ? [path] : []
	})
}

const files = sources(APP)
const contents = new Map(files.map(file => [file, readFileSync(file, 'utf8')]))

/** `export function Xxx` — a component, not a hook or a helper. */
function componentsOf(file: string): string[] {
	return [
		...(contents.get(file) ?? '').matchAll(/export function ([A-Z]\w+)/g),
	].map(match => match[1] ?? '')
}

function isReferenced(name: string, own: string): boolean {
	const pattern = new RegExp(`\\b${name}\\b`)

	return files.some(
		file => file !== own && pattern.test(contents.get(file) ?? ''),
	)
}

function unreferenced(): string[] {
	return files
		.filter(file => !REACHED_BY_PATH.test(file))
		.filter(file => {
			const names = componentsOf(file)

			return names.length > 0 && names.every(name => !isReferenced(name, file))
		})
		.map(file => relative(APP, file))
}

describe('every component on disk', () => {
	it('finds the files it is meant to be reading', () => {
		expect(files.length).toBeGreaterThan(100)
	})

	it('is reached from somewhere, or says why it is not', () => {
		const orphans = unreferenced().filter(
			file => !(contents.get(join(APP, file)) ?? '').includes(MARKER),
		)

		expect(orphans).toEqual([])
	})

	// A parked list naming a file that is reached again is a lie, and the file
	// would keep its « kept unreferenced » note while being rendered.
	it('parks exactly the files that name themselves parked', () => {
		expect(unreferenced().sort()).toEqual([...PARKED].sort())
	})
})
