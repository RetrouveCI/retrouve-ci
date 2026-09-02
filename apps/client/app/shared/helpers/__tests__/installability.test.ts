import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { THEME_COLOR } from '../theme'

/**
 * The verdict needs a headed browser, so it is measured by hand. This holds what
 * it rests on — each thing Chromium was measured to refuse: a missing name, a
 * missing `start_url`, an unreachable icon, a non-standalone `display`.
 */
const CLIENT = process.cwd()

const readAsset = (name: string) => readFileSync(join(CLIENT, 'public', name))

const manifest = JSON.parse(
	readFileSync(join(CLIENT, 'public/manifest.webmanifest'), 'utf8'),
)

/** A PNG carries its size in the IHDR chunk, at a fixed offset. */
function pngSize(name: string) {
	const png = readAsset(name)
	return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) }
}

describe('the manifest', () => {
	it('asks to be installed, in French, from the root', () => {
		expect(manifest.name).toBe('RetrouveCI')
		expect(manifest.short_name).toBe('RetrouveCI')
		expect(manifest.lang).toBe('fr')
		expect(manifest.start_url).toBe('/')
		expect(manifest.scope).toBe('/')
		expect(manifest.display).toBe('standalone')
	})

	it('paints its splash in the light theme it opens on', () => {
		expect(manifest.theme_color).toBe(THEME_COLOR.light)
		expect(manifest.background_color).toBe(THEME_COLOR.light)
	})

	it.each([
		['192x192', 'any'],
		['512x512', 'any'],
		['512x512', 'maskable'],
	])('declares a %s %s icon whose file is that size', (sizes, purpose) => {
		const icon = manifest.icons.find(
			(candidate: { sizes: string; purpose: string }) =>
				candidate.sizes === sizes && candidate.purpose === purpose,
		)

		expect(icon).toBeDefined()
		expect(icon.type).toBe('image/png')

		const [width, height] = sizes.split('x').map(Number)
		expect(pngSize(icon.src.slice(1))).toEqual({ width, height })
	})
})

/**
 * `ScanMiseEnAvant`, third column. The wording is the canvas's own, and a `url`
 * outside `app/routes.ts` would be a menu entry leading nowhere — which the
 * browser reports as nothing at all, never as an error.
 */
const SHORTCUTS = [
	['Scanner un sticker', '/scan'],
	['Publier une annonce', '/publish'],
	['Rechercher un objet', '/posts'],
] as const

describe('the long-press shortcuts', () => {
	const routes = readFileSync(join(CLIENT, 'app/routes.ts'), 'utf8')

	it('are the canvas’s three, in its order', () => {
		expect(manifest.shortcuts.map((s: { name: string }) => s.name)).toEqual(
			SHORTCUTS.map(([name]) => name),
		)
	})

	it.each(SHORTCUTS)('%s points at a mounted route', (name, url) => {
		const shortcut = manifest.shortcuts.find(
			(candidate: { name: string }) => candidate.name === name,
		)

		expect(shortcut.url).toBe(url)
		expect(routes).toContain(`route('${url.slice(1)}'`)
	})

	it.each(SHORTCUTS)('%s carries a 96 px icon', name => {
		const shortcut = manifest.shortcuts.find(
			(candidate: { name: string }) => candidate.name === name,
		)

		expect(pngSize(shortcut.icons[0].src.slice(1))).toEqual({
			width: 96,
			height: 96,
		})
	})
})

/**
 * A source check, like `auth-brand-sources`: no unit test renders `<head>`, and
 * losing one of these tags simply stops the app being installable, silently.
 */
describe('what root.tsx puts in the document head', () => {
	const source = readFileSync(join(CLIENT, 'app/root.tsx'), 'utf8')

	it('links the manifest and the icons a launcher reads', () => {
		expect(source).toContain("rel: 'manifest'")
		expect(source).toContain("href: '/manifest.webmanifest'")
		expect(source).toContain("href: '/icon-192.png'")
		expect(source).toContain("rel: 'apple-touch-icon'")
	})

	// Asserted on the tag, not on the selector the pre-paint script uses.
	it('declares one theme-color, driven rather than queried', () => {
		expect(source.match(/<meta\s+name="theme-color"/g)).toHaveLength(1)
		expect(source).not.toContain('prefers-color-scheme: light')
		expect(source).toContain(
			"THEME_COLOR[preference === 'dark' ? 'dark' : 'light']",
		)
		expect(source).toContain('meta[name="theme-color"]')
	})

	it('names the app for an iOS home screen that ignores the manifest', () => {
		expect(source).toContain('apple-mobile-web-app-title')
	})
})

// Nothing links the constant to the token it was measured from, so this fails
// the day the token moves and says what to do about it.
describe('the chrome colour against its token', () => {
	const globals = readFileSync(
		join(CLIENT, '../../packages/ui/src/styles/globals.css'),
		'utf8',
	)

	it.each([
		['light', 'oklch(1 0 0)', '#ffffff'],
		['dark', 'oklch(0.145 0.01 256)', '#080a0e'],
	])(
		'%s --background is still %s, measured as %s',
		(theme, token, measured) => {
			expect(globals).toContain(`--background: ${token}`)
			expect(THEME_COLOR[theme as 'light' | 'dark']).toBe(measured)
		},
	)
})
