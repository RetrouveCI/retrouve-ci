import { createRoutesStub } from 'react-router'
import { cleanup, page, render, userEvent } from '@/shared/helpers/testing'
import { ThemeProvider } from '@/context/theme'
import type { ThemePreference } from '@/shared/helpers/theme'
import { AppearanceSection } from '../appearance-section'

/**
 * R5 exists so the theme is reachable on a phone **before** R6 removes the side
 * menu that used to hold the only control. So what is asserted is the contract
 * the settings screen owes: three choices, the current one shown as current, and
 * a click that both paints and persists.
 */
function renderSection(initialPreference: ThemePreference = 'system') {
	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<ThemeProvider initialPreference={initialPreference}>
					<AppearanceSection />
				</ThemeProvider>
			),
		},
	])
	render(<Stub initialEntries={['/']} />)
}

const option = (name: string) => page.getByRole('radio', { name })

afterEach(() => {
	cleanup()
	document.documentElement.classList.remove('dark')
	document.documentElement.style.colorScheme = ''
	document.cookie = 'theme=;path=/;max-age=0'
})

describe('Apparence', () => {
	// Three previews, not a switch: a two-state control cannot express `system`.
	it.each(['Clair', 'Sombre', 'Système'])('offers %s', async name => {
		renderSection()

		await expect.element(option(name)).toBeInTheDocument()
	})

	it('shows the stored preference as the current one', async () => {
		renderSection('dark')

		await expect.element(option('Sombre')).toBeChecked()
		await expect.element(option('Clair')).not.toBeChecked()
	})

	it('defaults to Système, which is the new default', async () => {
		renderSection()

		await expect.element(option('Système')).toBeChecked()
	})

	it('paints and persists a choice', async () => {
		renderSection('light')

		await userEvent.click(option('Sombre'))

		await expect.element(option('Sombre')).toBeChecked()
		expect(document.documentElement.classList.contains('dark')).toBe(true)
		expect(document.cookie).toContain('theme=dark')
	})

	/**
	 * `system` must hand the decision back to the device rather than pin a value:
	 * `color-scheme: light dark` is what keeps native controls following it.
	 */
	it('hands the decision back to the device on Système', async () => {
		renderSection('dark')

		await userEvent.click(option('Système'))

		expect(document.cookie).toContain('theme=system')
		expect(document.documentElement.style.colorScheme).toBe('light dark')
	})
})
