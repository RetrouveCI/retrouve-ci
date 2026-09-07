import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'app'

// A hand-built `Cookie` sends no caller address, so the API keys its bucket on
// this container: the R44 bug, 5 OTPs per 15 minutes platform-wide.
const HAND_BUILT = /Cookie: request\.headers\.get/

/** A raw `fetch`: multipart needs `FormData`'s own boundary, so no `apiFetch`. */
const ALLOWED = ['routes/publish/servers/upload.service.ts']

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

	// An allowlist that names a file which no longer offends is a lie.
	it.each(ALLOWED)('keeps %s on the allowlist for a reason', allowed => {
		const file = sources(APP).find(path => path.endsWith(allowed))

		expect(file, `${allowed} is allowed but absent`).toBeDefined()
		expect(HAND_BUILT.test(readFileSync(file as string, 'utf8'))).toBe(true)
	})
})
