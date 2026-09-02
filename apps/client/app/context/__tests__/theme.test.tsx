import { page, render, userEvent } from '@/shared/helpers/testing'
import { THEME_COLOR } from '@/shared/helpers/theme'
import { ThemeProvider, useTheme } from '../theme'

/**
 * R23 chose one driven `theme-color` tag over two `media` ones precisely so a
 * switch in Réglages would move it. That claim is worth an assertion.
 */
function Switcher() {
	const { setTheme, theme } = useTheme()

	return (
		<>
			<span>theme: {theme}</span>
			<button type="button" onClick={() => setTheme('dark')}>
				sombre
			</button>
			<button type="button" onClick={() => setTheme('light')}>
				clair
			</button>
		</>
	)
}

const chrome = () =>
	document.querySelector('meta[name="theme-color"]')?.getAttribute('content')

describe('ThemeProvider and the browser chrome', () => {
	let tag: HTMLMetaElement

	beforeEach(() => {
		// The document here is the runner's, not the one `root.tsx` renders.
		tag = document.createElement('meta')
		tag.name = 'theme-color'
		tag.content = THEME_COLOR.light
		document.head.append(tag)
	})

	// `apply` writes the real document; the next test must not inherit it.
	afterEach(() => {
		tag.remove()
		document.documentElement.classList.remove('dark')
		document.documentElement.style.colorScheme = ''
	})

	it('follows a switch to dark, and back', async () => {
		render(
			<ThemeProvider initialPreference="light">
				<Switcher />
			</ThemeProvider>,
		)

		await expect.element(page.getByText('theme: light')).toBeInTheDocument()
		expect(chrome()).toBe(THEME_COLOR.light)

		await userEvent.click(page.getByRole('button', { name: 'sombre' }))

		await expect.element(page.getByText('theme: dark')).toBeInTheDocument()
		expect(chrome()).toBe(THEME_COLOR.dark)
		expect(document.documentElement.classList.contains('dark')).toBe(true)

		await userEvent.click(page.getByRole('button', { name: 'clair' }))

		await expect.element(page.getByText('theme: light')).toBeInTheDocument()
		expect(chrome()).toBe(THEME_COLOR.light)
	})

	// The tag is optional on purpose: nothing guarantees a head this app wrote.
	it('paints the theme even with no tag to colour', async () => {
		tag.remove()

		render(
			<ThemeProvider initialPreference="dark">
				<Switcher />
			</ThemeProvider>,
		)

		await expect.element(page.getByText('theme: dark')).toBeInTheDocument()
		expect(document.documentElement.classList.contains('dark')).toBe(true)
	})
})
