import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'app'

// `apiFetch` requires the request, so the compiler holds that half — R44's
// guard tested one spelling and missed six calls. What a type cannot see is a
// raw `fetch` to the API, bypassing the derivation: that is what this reads for.

const BYPASS = /\bfetch\(/
const ADDRESSES_THE_API = /apiUrl/

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

function bypasses(file: string): boolean {
	const source = readFileSync(file, 'utf8')

	return BYPASS.test(source) && ADDRESSES_THE_API.test(source)
}

describe('every server-side call speaks for the visitor', () => {
	it('finds the files it is meant to be reading', () => {
		expect(sources(APP).length).toBeGreaterThan(20)
	})

	it('leaves no call addressing the API outside apiFetch', () => {
		const offenders = sources(APP).filter(
			file =>
				bypasses(file) && !ALLOWED.some(allowed => file.endsWith(allowed)),
		)

		expect(offenders).toEqual([])
	})

	it('allows no exception at all', () => {
		expect(ALLOWED).toEqual([])
	})
})
