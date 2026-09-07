import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// A guard, not a unit test: nothing stops a new route from marking itself
// anonymous and delegating to a use-case that answers with everything. R50
// found this probe naming two controllers while five carried such a route, so
// it discovers them now — the omission was the case it exists to catch.

const SRC = resolve(__dirname, '../..')
const PRESENTATIONS = join(SRC, 'presentations')

const PUBLIC_DECORATORS = ['@AllowAnonymous()', '@OptionalAuth()']

/** Every anonymous route, and the use-cases it may reach. */
const INVENTORY: Record<string, string[]> = {
	'presentations/contact-messages/contact-messages.controller.ts': [
		'CreateContactMessageUseCase',
	],
	'presentations/events/events.controller.ts': [
		'GetEventByIdUseCase',
		'GetPaginatedEventsUseCase',
	],
	// Anonymous at class level, and it reaches no use-case at all.
	'presentations/health/health.controller.ts': [],
	'presentations/lost-items/lost-items.controller.ts': [
		'ContactLostItemPosterUseCase',
		'GetPublicLostItemsUseCase',
		'ViewLostItemUseCase',
	],
	'presentations/matching/matching.controller.ts': ['FindMatchesUseCase'],
	'presentations/qr-codes/qr-codes.controller.ts': [
		'ContactQrTokenOwnerUseCase',
		'GetQrTokenPublicViewUseCase',
		'ReachQrTokenOwnerUseCase',
	],
}

// What each one may answer, `PROJECTED` being those that hand back a listing.
// Naming a narrower shape is what keeps an exemption from rotting into
// « answers everything ».
const ANSWERS: Record<string, string> = {
	ContactLostItemPosterUseCase: 'ContactTarget',
	ContactQrTokenOwnerUseCase: 'void',
	CreateContactMessageUseCase: 'ContactMessage',
	FindMatchesUseCase: 'PublicMatchCandidate[]',
	GetEventByIdUseCase: 'Event',
	GetPaginatedEventsUseCase: 'EventListResponse',
	GetPublicLostItemsUseCase: 'PublicLostItemListResponse',
	GetQrTokenPublicViewUseCase: 'QrTokenPublicView',
	ReachQrTokenOwnerUseCase: 'ReachQrTokenOwnerOutput',
	ViewLostItemUseCase: 'LostItem | PublicLostItem',
}

const PROJECTED = [
	'FindMatchesUseCase',
	'GetPublicLostItemsUseCase',
	'ViewLostItemUseCase',
]

const read = (path: string) => readFileSync(join(SRC, path), 'utf8')

function controllers(): string[] {
	const walk = (dir: string): string[] =>
		readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
			const path = join(dir, entry.name)
			if (entry.isDirectory())
				return entry.name === '__tests__' ? [] : walk(path)
			return entry.name.endsWith('.controller.ts') ? [path] : []
		})

	return walk(PRESENTATIONS).map(path => relative(SRC, path))
}

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

function isPublicThroughout(source: string): boolean {
	const beforeClass = source.split('export class')[0] ?? ''

	return PUBLIC_DECORATORS.some(decorator => beforeClass.includes(decorator))
}

function useCasesReachedAnonymously(controller: string): string[] {
	const source = read(controller)
	const types = constructorTypes(source)
	const wholeClass = isPublicThroughout(source)
	const names = new Set<string>()

	for (const block of splitHandlers(source)) {
		const isPublic =
			wholeClass || PUBLIC_DECORATORS.some(d => block.includes(d))
		if (!isPublic) continue

		for (const match of block.matchAll(/this\.(\w+)\.execute/g)) {
			const property = match[1] ?? ''
			const className = types.get(property)

			if (!className) {
				throw new Error(`${property} is not a constructor dependency`)
			}

			names.add(className)
		}
	}

	return [...names].sort()
}

function discovered(): Record<string, string[]> {
	const found: Record<string, string[]> = {}

	for (const controller of controllers()) {
		const names = useCasesReachedAnonymously(controller)
		const source = read(controller)

		if (
			names.length ||
			isPublicThroughout(source) ||
			PUBLIC_DECORATORS.some(d => source.includes(d))
		) {
			found[controller] = names
		}
	}

	return found
}

function sourceOf(useCase: string): string {
	const controller = Object.keys(INVENTORY).find(path =>
		read(path).includes(useCase),
	)

	if (!controller) throw new Error(`no controller injects ${useCase}`)

	return read(importedFrom(read(controller), useCase))
}

describe('reads open to the public', () => {
	it('finds every controller with an anonymous route, and only those', () => {
		expect(discovered()).toEqual(INVENTORY)
	})

	it('reads more controllers than it names as anonymous', () => {
		expect(controllers().length).toBeGreaterThan(Object.keys(INVENTORY).length)
	})

	it.each(Object.values(INVENTORY).flat())(
		'%s answers a shape named here',
		useCase => {
			const shape = ANSWERS[useCase]

			expect(
				shape,
				`${useCase} answers something nobody wrote down`,
			).toBeDefined()
			expect(sourceOf(useCase)).toContain(`Promise<${shape}>`)
		},
	)

	it.each(PROJECTED)('%s hands its listing through the projection', useCase => {
		expect(sourceOf(useCase)).toContain('toPublicLostItem')
	})

	// The list use-case serves the backoffice too, so the anonymous route is
	// what narrows it: without this line a draft event would be listed publicly.
	it('narrows the anonymous event list to published', () => {
		const [anonymousList] = splitHandlers(
			read('presentations/events/events.controller.ts'),
		).filter(block => PUBLIC_DECORATORS.some(d => block.includes(d)))

		expect(anonymousList).toContain("status: 'published'")
	})
})
