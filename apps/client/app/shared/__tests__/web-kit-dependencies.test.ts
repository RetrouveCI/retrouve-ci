import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const PACKAGE = resolve('..', '..', 'packages', 'web-kit')

/**
 * CI caught what no local command could: `react` sits in the workspace root's
 * `node_modules` here, so TypeScript resolved it by walking up and `pnpm
 * typecheck` passed while the isolated install on CI failed. A source-only
 * package must therefore declare what it imports — this guard lives in the
 * client because `packages/web-kit` has no test runner of its own, as the
 * `cn()` token guard does.
 */
const BUILT_IN = /^(node:|\.)/

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return sources(path)
		return /\.tsx?$/.test(entry.name) ? [path] : []
	})
}

/** `react-router` from `react-router/dom`, `@app/x` from `@app/x/y`. */
function packageOf(specifier: string): string {
	const parts = specifier.split('/')

	return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!
}

function imported(): string[] {
	const names = new Set<string>()

	for (const file of sources(join(PACKAGE, 'src'))) {
		const source = readFileSync(file, 'utf8')

		for (const match of source.matchAll(/from '([^']+)'/g)) {
			const specifier = match[1] ?? ''

			if (!BUILT_IN.test(specifier)) names.add(packageOf(specifier))
		}
	}

	return [...names].sort()
}

function declared(): string[] {
	const manifest = JSON.parse(
		readFileSync(join(PACKAGE, 'package.json'), 'utf8'),
	) as Record<string, Record<string, string> | undefined>

	return [
		...Object.keys(manifest['dependencies'] ?? {}),
		...Object.keys(manifest['peerDependencies'] ?? {}),
	].sort()
}

describe('@app/web-kit', () => {
	it('finds the source it is meant to be reading', () => {
		expect(imported().length).toBeGreaterThan(2)
	})

	it('declares every package it imports', () => {
		const missing = imported().filter(name => !declared().includes(name))

		expect(missing).toEqual([])
	})
})
