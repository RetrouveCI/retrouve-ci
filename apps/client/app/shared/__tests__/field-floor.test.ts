import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { cn } from '@app/ui/utils'

const THEME = 'node_modules/@app/ui/src/styles/globals.css'
const PRIMITIVES = 'node_modules/@app/ui/src/components/ui'
const APP = 'app'

/** A token Tailwind spells itself; anything else is one this theme invented. */
const STANDARD_SIZE =
	/^(?:\d+(?:\.\d+)?|px|none|full|auto|screen|fit|min|max|[23]?x?s|sm|base|md|lg|[2-9]xl|xl)$/

const LADDER = /(?<![\w:-])text-(?:xs|sm|base|lg|xl|2xl|3xl)\b/
const NON_TYPING = new Set([
	'file',
	'hidden',
	'checkbox',
	'radio',
	'range',
	'color',
	'submit',
	'button',
	'image',
	'reset',
])

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory())
			return entry.name === '__tests__' ? [] : sources(path)
		return entry.name.endsWith('.tsx') ? [path] : []
	})
}

/** The opening tag alone: a child's own className must not count as the field's. */
function openingTag(src: string, from: number): string {
	let depth = 0
	for (let i = from; i < src.length; i++) {
		const char = src[i]
		if (char === '{') depth++
		else if (char === '}') depth--
		else if (char === '>' && depth === 0) return src.slice(from, i)
	}
	return src.slice(from, from + 400)
}

interface Field {
	file: string
	line: number
	tag: string
	classes: string
}

function fields(): Field[] {
	const found: Field[] = []
	for (const file of sources(APP)) {
		const src = readFileSync(file, 'utf8')
		const tags = /<(Input|Textarea|SelectTrigger|input|textarea|select)\b/g
		for (let hit = tags.exec(src); hit; hit = tags.exec(src)) {
			const tag = openingTag(src, hit.index + hit[0].length)
			const type = /type=\{?["']?(\w+)/.exec(tag)?.[1]
			if (type && NON_TYPING.has(type)) continue

			found.push({
				file,
				line: src.slice(0, hit.index).split('\n').length,
				tag: hit[1],
				classes: [...tag.matchAll(/className=(\{[^}]*\}|"[^"]*")/g)]
					.map(m => m[1])
					.join(' '),
			})
		}
	}
	return found
}

/** §2.1's floor, forbidden as a class rather than re-derived from the cascade. */
describe('the 16 px field floor', () => {
	it('finds the fields it is meant to be reading', () => {
		expect(fields().length).toBeGreaterThan(20)
	})

	it('is never argued with by a field carrying a class off the text ladder', () => {
		const offenders = fields()
			.filter(field => LADDER.test(field.classes))
			.map(
				field => `${field.file}:${field.line} <${field.tag}> ${field.classes}`,
			)

		expect(offenders).toEqual([])
	})
})

/** An unregistered token cannot hold its ground — see `cn()` for why. */
describe('the theme tokens cn() has to know', () => {
	const theme = readFileSync(THEME, 'utf8')

	const invented = (prefix: 'text' | 'spacing') =>
		[...theme.matchAll(new RegExp(`--${prefix}-([a-z0-9-]+):`, 'g'))]
			.map(match => match[1])
			.filter(name => !name.includes('--') && !STANDARD_SIZE.test(name))

	it('reads a theme that still declares its own scales', () => {
		expect(invented('text')).toEqual(['field'])
		expect(invented('spacing').sort()).toEqual(['chip', 'control'])
	})

	// Driven by what is written, not by every prefix Tailwind could make.
	it('resolves every custom utility the app writes against its own scale', () => {
		const used = new Set<string>()
		for (const file of sources(APP)) {
			const src = readFileSync(file, 'utf8')
			for (const hit of src.matchAll(
				/\b((?:min-|max-)?[a-z]+)-(field|control|chip)\b/g,
			))
				used.add(`${hit[1]}-${hit[2]}`)
		}

		expect(used.size).toBeGreaterThan(0)
		for (const utility of used) {
			const [prefix] = utility.split('-')
			const rival = prefix === 'text' ? 'text-sm' : `${prefix}-9`

			expect(cn(rival, utility), `${rival} then ${utility}`).toBe(utility)
			expect(cn(utility, rival), `${utility} then ${rival}`).toBe(rival)
		}
	})
})

/** R38's twin: `cn()` keeps this beside a bare height, then specificity wins. */
const VARIANT_HEIGHT = /(?:^|\s|")[a-z0-9:[\]&_*='.,()-]*\]:h-[0-9]/

/** Tailwind and this rule both read comments, so prose must not spell it out. */
function code(src: string): string {
	return src.replaceAll(/\/\/[^\n]*/g, '')
}

describe('a height cn() can actually reconcile', () => {
	it('is what every field primitive pins', () => {
		for (const file of ['input.tsx', 'textarea.tsx', 'select.tsx']) {
			const src = code(readFileSync(join(PRIMITIVES, file), 'utf8'))

			expect(VARIANT_HEIGHT.test(src), file).toBe(false)
		}
	})

	it('is what every field in the app asks for', () => {
		const offenders = fields()
			.filter(field => VARIANT_HEIGHT.test(field.classes))
			.map(field => `${field.file}:${field.line} <${field.tag}>`)

		expect(offenders).toEqual([])
	})

	// A floor, never a height: the R38 lesson, and no call site supplies it.
	it('leaves SelectTrigger floored at 44 px on a phone', () => {
		const src = readFileSync(join(PRIMITIVES, 'select.tsx'), 'utf8')

		expect(src).toContain('min-h-11')
		expect(src).toContain('lg:min-h-0')
		expect(src).not.toMatch(/\blg:h-\d/)
	})
})
