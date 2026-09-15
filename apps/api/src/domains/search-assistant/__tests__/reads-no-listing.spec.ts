import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The plan's invariant n° 7 — « l'assistant ne lit jamais une ligne brute » —
 * as a property rather than a spelling: a file that cannot reach a row cannot
 * send one to a model. What holds it is that nothing in the assistant's own two
 * folders may import a repository, the database, or another domain.
 */
const SRC = resolve(__dirname, '../../..')

const SCANNED = [
	'domains/search-assistant',
	'infrastructures/assistant',
] as const

// Matched against what a file **imports**, never against its text: a comment
// saying « no repository » is not a repository, and a guard that cannot tell
// the two apart is a spelling check wearing a property's clothes.
const FORBIDDEN: [string, RegExp][] = [
	['the database package', /@app\/database/],
	['a repository', /repository/i],
	['Prisma', /prisma/i],
	// The assistant translates; what searches is `matching`, which the route
	// never calls — so an import from another domain is the first sign of it
	// having grown a corpus to read.
	['another domain', /@\/domains\/(?!search-assistant)/],
]

/** The module specifiers a file pulls in, which is what it can reach. */
function importsOf(source: string): string[] {
	return [...source.matchAll(/from\s+'([^']+)'/g)].map(match => match[1] ?? '')
}

function sources(): string[] {
	const walk = (dir: string): string[] =>
		readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
			const path = join(dir, entry.name)

			if (entry.isDirectory()) {
				return entry.name === '__tests__' ? [] : walk(path)
			}

			return entry.name.endsWith('.ts') ? [path] : []
		})

	return SCANNED.flatMap(folder => walk(join(SRC, folder)))
}

describe('the search assistant', () => {
	const files = sources()

	// Otherwise a rename would leave this guard scanning nothing and green.
	it('finds the files it is meant to be reading', () => {
		expect(files.length).toBeGreaterThan(4)
	})

	it.each(FORBIDDEN)(
		'imports nothing that reaches a row through %s',
		(_, shape) => {
			const offenders = files
				.filter(file =>
					importsOf(readFileSync(file, 'utf8')).some(path => shape.test(path)),
				)
				.map(file => relative(SRC, file))

			expect(offenders).toEqual([])
		},
	)

	// The other half of the invariant: what leaves for the model is the phrase
	// and the invite, and the invite is built from the filter set alone.
	it('sends the gateway nothing but the invite and the phrase', () => {
		const useCase = readFileSync(
			join(
				SRC,
				'domains/search-assistant/use-cases/interpret-search-phrase.use-case.ts',
			),
			'utf8',
		)

		expect(useCase).toContain(
			'buildExtractionPrompt(new Date()),\n\t\t\tphrase,',
		)
	})
})
