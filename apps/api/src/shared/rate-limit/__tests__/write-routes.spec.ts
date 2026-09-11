import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { limitFor } from '../rate-limit.policy'

const PRESENTATIONS = 'src/presentations'

// Each acts on a row the caller already owns, so what it can spend is bounded
// by what they hold. A new route lands in no class and turns this red.
const OWNER_SCOPED_WRITES: string[] = [
	'/lost-items/:id',
	'/lost-items/:id/comments/read',
	'/notifications/read-all',
	'/notifications/:id/read',
	'/qr-codes/:code',
	'/qr-codes/:code/activate',
	'/qr-codes/:code/revoke',
]

interface WriteRoute {
	method: string
	path: string
	adminOnly: boolean
	file: string
}

function controllers(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)

		if (entry.isDirectory()) {
			return entry.name === '__tests__' ? [] : controllers(path)
		}

		return path.endsWith('.controller.ts') ? [path] : []
	})
}

// A handler is its run of decorators: the verb and the role guard sit in the
// same block, so reading the block is what ties them together.
const DECORATOR_BLOCK = /((?:^[\t ]*@[\w.]+\([^)]*\)[\t ]*\r?\n)+)/gm
const WRITE_VERB = /@(Post|Patch|Put|Delete)\(\s*(?:'([^']*)')?\s*\)/
const ADMIN_ONLY = /@Roles\(\s*\[\s*'admin'\s*\]\s*\)/

function writeRoutes(): WriteRoute[] {
	return controllers(PRESENTATIONS).flatMap(file => {
		const source = readFileSync(file, 'utf8')
		const prefix = source.match(/@Controller\(\s*'([^']*)'\s*\)/)?.[1] ?? ''

		return [...source.matchAll(DECORATOR_BLOCK)].flatMap(([, block]) => {
			const verb = block?.match(WRITE_VERB)

			if (!verb) return []

			const suffix = verb[2] ?? ''

			return [
				{
					method: (verb[1] ?? '').toUpperCase(),
					path: `/${[prefix, suffix].filter(Boolean).join('/')}`,
					adminOnly: ADMIN_ONLY.test(block ?? ''),
					file,
				},
			]
		})
	})
}

/** `limitFor` matches on shapes, so a parameter needs a plausible value. */
const concrete = (path: string) =>
	path.replaceAll(/:[A-Za-z]+/g, 'clx0000000000')

// Exactly one class per route: capped, admin-only, or owner-scoped. Two of the
// three are derived from the source, so a new route cannot pass by resembling.
describe('the write routes', () => {
	const routes = writeRoutes()

	it('finds the routes it is meant to be reading', () => {
		expect(routes.length).toBeGreaterThan(15)
	})

	it('accounts for every one of them', () => {
		const unaccounted = routes
			.filter(route => limitFor(route.method, concrete(route.path)) === null)
			.filter(route => !route.adminOnly)
			.filter(route => !OWNER_SCOPED_WRITES.includes(route.path))
			.map(route => `${route.method} ${route.path}`)

		expect(unaccounted).toEqual([])
	})

	// Both halves, so the list cannot rot: a path that stops being a route, or
	// that later gains a ceiling, must leave the list.
	it.each(OWNER_SCOPED_WRITES)('still has %s as a route', path => {
		expect(routes.map(route => route.path)).toContain(path)
	})

	it.each(OWNER_SCOPED_WRITES)('has no ceiling on %s to make it moot', path => {
		const route = routes.find(item => item.path === path)

		expect(limitFor(route?.method ?? 'POST', concrete(path))).toBeNull()
	})

	// The two routes that spend real money, asserted here so a refactor that
	// drops one from the policy is a failure and not a silence.
	it.each([
		['POST', '/uploads/lost-item-photo'],
		['POST', '/sticker-orders'],
	])('keeps a ceiling on %s %s', (method, path) => {
		expect(limitFor(method, path)).not.toBeNull()
	})
})
