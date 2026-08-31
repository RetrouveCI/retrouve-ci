import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * R3's guard. The design tokens are the only place a colour is decided, so the
 * ratios are computed from `globals.css` itself rather than from a copy: a token
 * edited to an inaccessible value fails here, not in review.
 *
 * The interesting surfaces are not only `--background` and `--card`. Brand green
 * and brand orange are also laid as `/5`, `/10` and `/20` tints under their own
 * ink -- the badge pattern -- and that is where the flat brand colours failed
 * first, at 4.41:1 and 4.06:1. So each tint is composited and checked too.
 */
const CSS = readFileSync(
	fileURLToPath(
		new URL(
			'../../../../../../packages/ui/src/styles/globals.css',
			import.meta.url,
		),
	),
	'utf-8',
)

const AA_TEXT = 4.5

type Rgb = readonly [number, number, number]

function block(selector: string): string {
	const found = CSS.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`))
	if (!found) throw new Error(`no ${selector} block in globals.css`)
	return found[1]
}

const ROOT = block(':root')
const DARK = block('\\.dark')

/** The declared value of a token, preferring `.dark`'s override when asked. */
function token(name: string, dark: boolean): string {
	const read = (source: string) =>
		source.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim()
	const value = (dark ? read(DARK) : undefined) ?? read(ROOT)
	if (!value) throw new Error(`token --${name} is not declared`)
	return value
}

/** sRGB, gamma-encoded, 0..1 — the space a browser composites in. */
function parse(value: string): Rgb {
	const hex = value.match(/^#([0-9a-f]{6})$/i)
	if (hex) {
		const n = parseInt(hex[1], 16)
		return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(
			c => c / 255,
		) as unknown as Rgb
	}
	const oklch = value.match(/^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)$/)
	if (!oklch) throw new Error(`unsupported colour: ${value}`)
	return oklchToSrgb(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]))
}

function oklchToSrgb(L: number, C: number, H: number): Rgb {
	const h = (H * Math.PI) / 180
	const a = C * Math.cos(h)
	const b = C * Math.sin(h)
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
	const linear = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	]
	return linear.map(encode) as unknown as Rgb
}

const encode = (c: number) => {
	const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
	return Math.min(1, Math.max(0, v))
}
const decode = (c: number) =>
	c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

/** Tailwind's `bg-x/NN`: the tint is composited in gamma space, as a browser does. */
const tint = (over: Rgb, under: Rgb, alpha: number): Rgb =>
	over.map((c, i) => c * alpha + under[i] * (1 - alpha)) as unknown as Rgb

function contrast(a: Rgb, b: Rgb): number {
	const luminance = (c: Rgb) => {
		const [r, g, bl] = c.map(decode)
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl
	}
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return (hi + 0.05) / (lo + 0.05)
}

/** Every surface an ink token is laid on, for one theme. */
function surfaces(dark: boolean, hue: string): Record<string, Rgb> {
	const page = parse(token('background', dark))
	const flat = parse(token(hue, dark))
	return {
		'--background': page,
		'--card': parse(token('card', dark)),
		'--muted': parse(token('muted', dark)),
		[`${hue}/5`]: tint(flat, page, 0.05),
		[`${hue}/10`]: tint(flat, page, 0.1),
		[`${hue}/20`]: tint(flat, page, 0.2),
	}
}

describe.each([
	['light', false],
	['dark', true],
])('%s theme', (_theme, dark) => {
	describe.each([
		['--primary-green-text', 'primary-green'],
		['--accent-orange-text', 'accent-orange'],
	])('%s', (ink, hue) => {
		const colour = parse(token(ink.slice(2), dark))

		it.each(Object.keys(surfaces(dark, hue)))('reads on %s', surface => {
			expect(
				contrast(colour, surfaces(dark, hue)[surface]),
			).toBeGreaterThanOrEqual(AA_TEXT)
		})
	})
})

/**
 * §2.1: the orange flat carries dark ink, never white (2.70:1). The flat does
 * not follow the theme, so neither may its ink -- `--foreground` would flip to
 * near-white in the dark theme and put the forbidden pairing straight back.
 */
describe('ink on the orange flat', () => {
	it.each([
		['accent-orange', 'the flat'],
		['accent-orange-dark', 'its hover'],
	])('holds AA on %s (%s)', hue => {
		const ink = parse(token('accent-orange-foreground', false))
		expect(contrast(ink, parse(token(hue, false)))).toBeGreaterThanOrEqual(
			AA_TEXT,
		)
	})

	it('does not follow the theme', () => {
		expect(token('accent-orange-foreground', true)).toBe(
			token('accent-orange-foreground', false),
		)
	})

	it('rejects white, which is what §2.1 forbids', () => {
		expect(
			contrast([1, 1, 1], parse(token('accent-orange', false))),
		).toBeLessThan(AA_TEXT)
	})
})

/**
 * Every `--x` / `--x-foreground` couple in the palette, both themes. This is the
 * pass that found what the brand ramps hid: `--accent` is a saturated orange
 * here rather than shadcn's neutral, so its white ink read 3.05:1 and 2.62:1 --
 * the pairing §2.1 forbids, reached through every `hover:bg-accent` in the
 * package -- and `--primary` lifted for the dark theme fell to 4.03:1 under its
 * own white.
 */
describe.each([
	['light', false],
	['dark', true],
])('%s theme, surface and its foreground', (_theme, dark) => {
	const PAIRS = [
		'primary',
		'secondary',
		'muted',
		'accent',
		'destructive',
		'card',
		'popover',
		'sidebar',
		'sidebar-primary',
		'sidebar-accent',
	]

	it.each(PAIRS)('--%s', name => {
		const surface = parse(token(name, dark))
		const ink = parse(token(`${name}-foreground`, dark))

		expect(contrast(ink, surface)).toBeGreaterThanOrEqual(AA_TEXT)
	})

	// `--muted-foreground` is body copy, and it lands on more than `--muted`.
	it.each(['background', 'card', 'muted'])(
		'--muted-foreground on --%s',
		name => {
			const ink = parse(token('muted-foreground', dark))

			expect(contrast(ink, parse(token(name, dark)))).toBeGreaterThanOrEqual(
				AA_TEXT,
			)
		},
	)
})

/** A visitor who asks for less motion must get it from the shared stylesheet. */
describe('reduced motion', () => {
	it('is honoured globally', () => {
		expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\)/)
	})
})
