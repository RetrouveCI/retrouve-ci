import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import type { UserProfile } from '../../mappers/profile.mapper'
import { PersonalInfoSection } from '../personal-info-section'
import '../../../../../app.css'

/** §2.1: a field and a primary action are 48 px, and 44 is the touch floor. */
const CONTROL = 48

const USER: UserProfile = {
	name: 'Konan Yao',
	email: 'konan@example.ci',
	phone: '+225 07 00 00 00 00',
	phoneVerified: true,
	city: 'Abidjan',
	commune: 'Cocody',
	zone: 'Cocody, Abidjan',
	memberSince: 'Janvier 2026',
}

function mount() {
	const Stub = createRoutesStub([
		{
			path: '/account/settings',
			Component: () => <PersonalInfoSection user={USER} />,
			action: (async () => ({ success: true })) as never,
		},
	])
	render(<Stub initialEntries={['/account/settings']} />)
}

const height = (element: Element) =>
	parseFloat(getComputedStyle(element).height)

/** Everything inside the open dialog a thumb aims at or types into. */
function controlsOf(dialog: Element): Element[] {
	return [
		...dialog.querySelectorAll(
			'input:not([type="hidden"]), button[type="submit"]',
		),
	]
}

beforeEach(() => {
	stopAnimations()
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

/**
 * These four dialogs drew their fields and their primary action at 44 px, the
 * touch floor, where §2.1 asks for 48 — measured in the browser, since a class
 * `cn()` keeps can still lose in the cascade (R41).
 */
describe('the settings dialogs', () => {
	it.each([
		[/^Nom/, 'Nom et prénoms'],
		[/^Téléphone/, 'Numéro de téléphone'],
		[/^Ville et commune/, 'Ville et commune'],
		[/^Mot de passe/, 'Mot de passe'],
	] as const)(
		'draws every control of %s at the control height',
		async (row, dialogName) => {
			await page.viewport(390, 800)
			mount()

			await userEvent.click(page.getByRole('button', { name: row }))
			await expect
				.element(page.getByRole('dialog', { name: dialogName }))
				.toBeInTheDocument()

			const controls = controlsOf(
				page.getByRole('dialog', { name: dialogName }).element(),
			)

			expect(controls.length, 'the probe found no control').toBeGreaterThan(0)
			for (const control of controls)
				expect(height(control), control.outerHTML.slice(0, 80)).toBe(CONTROL)
		},
	)
})
