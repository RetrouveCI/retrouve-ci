import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// `packages/ui` has no runner, so the guard over its stylesheet lives here, as
// the other guards over shared front code do.
const SHARED_STYLES = join(
	process.cwd(),
	'..',
	'..',
	'packages',
	'ui',
	'src',
	'styles',
	'globals.css',
)

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'
const MOTION_PROPERTY =
	/(?:^|[;{\s])((?:animation|transition)(?:-duration|-delay)?)\s*:\s*([^;}]+)/g
const LITERAL_TIME = /(?<![\w-])\d*\.?\d+m?s\b/
const TOKEN_READ = /var\((--(?:motion|ease)-[\w-]+)\)/g
const TOKEN_DEFINED = /(--(?:motion|ease)-[\w-]+)\s*:/g

const css = readFileSync(SHARED_STYLES, 'utf8')

/** The stylesheet without the block that collapses every duration on purpose. */
function withoutReducedMotion(source: string): string {
	const start = source.indexOf(REDUCED_MOTION)
	if (start === -1) return source

	let depth = 0
	let end = source.indexOf('{', start)

	for (; end < source.length; end++) {
		if (source[end] === '{') depth++
		if (source[end] === '}' && --depth === 0) break
	}

	return source.slice(0, start) + source.slice(end + 1)
}

function motionDeclarations(source: string): string[] {
	return [...withoutReducedMotion(source).matchAll(MOTION_PROPERTY)].map(
		([, property, value]) => `${property}: ${(value ?? '').trim()}`,
	)
}

describe('the shared motion tokens', () => {
	it('finds the animations it is meant to be reading', () => {
		expect(motionDeclarations(css).length).toBeGreaterThanOrEqual(12)
	})

	// A duration written by hand is one nobody can tune from one place, and the
	// next animation copies it.
	it('writes no duration outside the tokens', () => {
		const offenders = motionDeclarations(css).filter(declaration =>
			LITERAL_TIME.test(declaration),
		)

		expect(offenders).toEqual([])
	})

	it('defines every token it reads', () => {
		const defined = new Set(
			[...css.matchAll(TOKEN_DEFINED)].map(([, name]) => name),
		)
		const undefinedTokens = [...css.matchAll(TOKEN_READ)]
			.map(([, name]) => name)
			.filter(name => !defined.has(name))

		expect(undefinedTokens).toEqual([])
	})
})

describe('a visitor who asks for less motion', () => {
	const block = css.slice(css.indexOf(REDUCED_MOTION))

	it('is answered in one place', () => {
		expect(css.split(REDUCED_MOTION)).toHaveLength(2)
	})

	// Collapsed, not removed: a reveal starts at `opacity: 0`, and cancelling its
	// animation outright would hide what it reveals.
	// ⚠️ The delays belong here as much as the durations: a staggered entry fills
	// `backwards`, so a child still waiting its turn is held at `opacity: 0`.
	// Clamping the duration alone leaves invisible cards for the stagger's length.
	it.each([
		'animation-duration: 1ms !important',
		'animation-delay: 0ms !important',
		'animation-iteration-count: 1 !important',
		'transition-duration: 1ms !important',
		'transition-delay: 0ms !important',
	])('gets %s on every element', declaration => {
		expect(block).toMatch(/\*,\s*\*::before,\s*\*::after\s*\{/)
		expect(block).toContain(declaration)
	})
})

/** The entry F13 gives every list of the app. */
describe('a list that appears one card after another', () => {
	const stagger = css.slice(css.indexOf('.animate-stagger > * {'))

	// ⚠️ Without `backwards`, a child waiting its turn is painted at full
	// opacity and blinks out when its turn comes.
	it('holds a child at its first frame until its turn', () => {
		expect(stagger).toMatch(/\.animate-stagger > \* \{[^}]*backwards/)
	})

	// A twentieth card waiting more than a second reads as a bug.
	it('stops lengthening the wait past the eighth child', () => {
		expect(stagger).toContain('.animate-stagger > *:nth-child(n + 8)')
	})

	/**
	 * The invariant §2.9: an entry animation never displaces what is already
	 * painted. `reveal` is the one keyframe it runs, and it touches nothing that
	 * takes part in layout.
	 */
	it('moves nothing that takes part in layout', () => {
		const reveal = css.slice(
			css.indexOf('@keyframes reveal'),
			css.indexOf('@keyframes pulse-soft'),
		)
		const properties = [...reveal.matchAll(/^\s*([a-z-]+)\s*:/gm)].map(
			([, name]) => name,
		)

		expect(properties.length).toBeGreaterThan(0)
		expect([...new Set(properties)].sort()).toEqual(['opacity', 'transform'])
	})
})
