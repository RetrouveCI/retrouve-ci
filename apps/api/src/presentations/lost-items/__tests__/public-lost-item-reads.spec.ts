import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A guard, not a unit test. The compiler refuses a full entity where a public
 * read is declared, but nothing stops a **new** route from marking itself
 * anonymous and delegating to the use-case that answers with everything.
 */

const SRC = resolve(__dirname, '../../..')

const CONTROLLERS = [
	'presentations/lost-items/lost-items.controller.ts',
	'presentations/matching/matching.controller.ts',
]

const PUBLIC_DECORATORS = ['@AllowAnonymous()', '@OptionalAuth()']

const read = (path: string) => readFileSync(join(SRC, path), 'utf8')

/** `@Get('mine')` … up to the next decorator that opens a handler. */
function splitHandlers(source: string): string[] {
	return source
		.split(/\n\t(?=@(?:Get|Post|Patch|Put|Delete)\()/)
		.filter(block => /@(?:Get|Post|Patch|Put|Delete)\(/.test(block))
}

/** A lone dependency carries no trailing comma, hence the parenthesis. */
function constructorTypes(source: string): Map<string, string> {
	const types = new Map<string, string>()

	for (const match of source.matchAll(/private readonly (\w+): (\w+)[,)]/g)) {
		const [, property, className] = match

		if (property && className) types.set(property, className)
	}

	return types
}

/** `import { X } from '@/domains/…'` → the file X lives in. */
function importedFrom(source: string, className: string): string {
	const pattern = new RegExp(
		`import(?: type)? \\{[^}]*\\b${className}\\b[^}]*\\} from '@/([^']+)'`,
	)
	const match = source.match(pattern)

	if (!match?.[1]) {
		throw new Error(`no import found for ${className}`)
	}

	return `${match[1]}.ts`
}

interface PublicHandler {
	controller: string
	useCase: string
	source: string
}

function collectPublicHandlers(): PublicHandler[] {
	const handlers: PublicHandler[] = []

	for (const controller of CONTROLLERS) {
		const source = read(controller)
		const types = constructorTypes(source)

		for (const block of splitHandlers(source)) {
			if (!PUBLIC_DECORATORS.some(decorator => block.includes(decorator))) {
				continue
			}

			for (const match of block.matchAll(/this\.(\w+)\.execute/g)) {
				const property = match[1] ?? ''
				const className = types.get(property)

				if (!className) {
					throw new Error(`${property} is not a constructor dependency`)
				}

				handlers.push({
					controller,
					useCase: className,
					source: read(importedFrom(source, className)),
				})
			}
		}
	}

	return handlers
}

describe('reads open to the public', () => {
	const handlers = collectPublicHandlers()

	// The probe must catch something before its verdict means anything.
	it('finds every route that answers without a session', () => {
		expect(handlers.map(handler => handler.useCase).sort()).toEqual([
			'FindMatchesUseCase',
			'GetPublicLostItemsUseCase',
			'RecordLostItemContactUseCase',
			'ViewLostItemUseCase',
		])
	})

	it.each(collectPublicHandlers())(
		'$useCase answers with the projection',
		({ source }) => {
			expect(source).toContain('PublicLostItem')
			expect(source).toContain('toPublicLostItem')
		},
	)
})
