import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'app'

// `apiFetch` requires the request, so the compiler holds that half — R44's
// guard tested one spelling and missed six calls. What a type cannot see is a
// raw `fetch` to the API, bypassing the derivation: that is what this reads for.

const BYPASS = /\bfetch\(/
const ADDRESSES_THE_API = /apiUrl/

/**
 * A raw `fetch`: multipart needs `FormData`'s own boundary, so no `apiFetch`.
 * The same exception the client makes, for the same reason.
 */
const ALLOWED = ['routes/dashboard/posts/new/servers/upload.service.ts']

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

	// Bypassing `apiFetch` without deriving its headers is the R44 bug itself,
	// and the backoffice has a third: with no `Origin` on a server-side call, the
	// audience is all that stops the API reading the public session.
	it.each(ALLOWED)('has %s derive every header by hand', allowed => {
		const file = sources(APP).find(path => path.endsWith(allowed))

		expect(file, `${allowed} is allowed but absent`).toBeDefined()
		expect(bypasses(file as string)).toBe(true)

		const source = readFileSync(file as string, 'utf8')
		expect(source).toContain("Cookie: request.headers.get('cookie')")
		expect(source).toContain('CLIENT_IP_HEADER')
		expect(source).toContain("'X-Auth-Audience': 'admin'")
	})
})
