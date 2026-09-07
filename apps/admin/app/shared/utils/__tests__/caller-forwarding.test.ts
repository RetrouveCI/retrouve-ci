import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'app'

/** A hand-built `Cookie` sends no caller address: the R44 bug. */
const HAND_BUILT = /Cookie: request\.headers\.get/

/** Nothing here posts multipart, so no call has a reason to bypass `apiFetch`. */
const ALLOWED: string[] = []

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory())
			return entry.name === '__tests__' ? [] : sources(path)
		return entry.name.endsWith('.ts') ? [path] : []
	})
}

describe('every server-side call speaks for the visitor', () => {
	it('finds the files it is meant to be reading', () => {
		expect(sources(APP).length).toBeGreaterThan(20)
	})

	it('leaves no call hand-building its own cookie header', () => {
		const offenders = sources(APP).filter(
			file =>
				HAND_BUILT.test(readFileSync(file, 'utf8')) &&
				!ALLOWED.some(allowed => file.endsWith(allowed)),
		)

		expect(offenders).toEqual([])
	})

	it('allows no exception at all', () => {
		expect(ALLOWED).toEqual([])
	})
})
