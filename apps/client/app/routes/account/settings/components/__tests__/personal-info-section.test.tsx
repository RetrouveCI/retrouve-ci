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

function renderSection(user: Partial<UserProfile> = {}) {
	const Stub = createRoutesStub([
		{
			path: '/account/settings',
			Component: () => <PersonalInfoSection user={{ ...USER, ...user }} />,
			action: (async () => ({ success: true })) as never,
		},
	])
	render(<Stub initialEntries={['/account/settings']} />)
}

beforeEach(() => {
	stopAnimations()
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('PersonalInfoSection', () => {
	it('gathers the four dialogs into one list of rows', async () => {
		renderSection()

		for (const label of [
			'Nom',
			'Téléphone',
			'Ville et commune',
			'Mot de passe',
		]) {
			await expect
				.element(page.getByRole('button', { name: new RegExp(label) }))
				.toBeInTheDocument()
		}
	})

	it('shows the stored value beside each label', async () => {
		renderSection()

		await expect.element(page.getByText('Konan Yao')).toBeInTheDocument()
		await expect
			.element(page.getByText('+225 07 00 00 00 00'))
			.toBeInTheDocument()
		await expect.element(page.getByText('Cocody, Abidjan')).toBeInTheDocument()
	})

	it('says so rather than showing nothing when a field is empty', async () => {
		renderSection({ phone: null, zone: null })

		await expect
			.element(page.getByText('Non renseigné', { exact: true }))
			.toBeInTheDocument()
		await expect
			.element(page.getByText('Non renseignée', { exact: true }))
			.toBeInTheDocument()
	})

	it('opens the name dialog from the row itself, not from a button beside it', async () => {
		renderSection()

		await userEvent.click(page.getByRole('button', { name: /^Nom/ }))

		await expect
			.element(page.getByRole('dialog', { name: 'Nom et prénoms' }))
			.toBeInTheDocument()
	})
})
