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
	it.each([
		'animation-duration: 1ms !important',
		'animation-iteration-count: 1 !important',
		'transition-duration: 1ms !important',
	])('gets %s on every element', declaration => {
		expect(block).toMatch(/\*,\s*\*::before,\s*\*::after\s*\{/)
		expect(block).toContain(declaration)
	})
})
