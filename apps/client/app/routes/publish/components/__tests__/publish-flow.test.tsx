import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import { writePublishDraft } from '../../helpers/publish-draft'
import { PublishFlow } from '../publish-flow'

function renderFlow() {
	const Stub = createRoutesStub([
		{
			path: '/publish/lost',
			Component: () => <PublishFlow type="lost" />,
			action: () => ({ success: true }),
		},
		// The step-2 card loads through this resource route as soon as a category
		// and a city are known.
		{ path: '/publish/matches', loader: () => ({ items: [] }) },
		{ path: '/', Component: () => <p>Accueil</p> },
	])

	render(<Stub initialEntries={['/publish/lost']} />)
}

const heading = (name: string) => page.getByRole('heading', { name })
// A step that is not current carries `hidden`, so it leaves the accessibility
// tree entirely: only a text query can still reach it to prove it is away.
const stepTitle = (text: string) => page.getByText(text, { exact: true })
const stepBack = () =>
	page.getByRole('button', { name: 'Étape précédente' }).first()
const advance = () => page.getByRole('button', { name: 'Continuer' })
const title = () => page.getByLabelText(/^Titre de l'annonce/)
const draftNotice = () => page.getByText('Brouillon enregistré')

async function describeObject() {
	await userEvent.fill(title(), 'Téléphone Tecno noir')
	await userEvent.click(page.getByRole('button', { name: 'Téléphone' }))
	await userEvent.fill(
		page.getByLabelText(/^Description/),
		'Coque bleue, écran fissuré en haut à droite.',
	)
}

beforeEach(() => {
	stopAnimations()
	localStorage.clear()
})

afterEach(() => {
	cleanup()
})

describe('the publish flow', () => {
	it('keeps the poster on the first step until the object is described', async () => {
		renderFlow()
		await userEvent.click(advance())

		await expect.element(heading("L'objet")).toBeVisible()
		await expect.element(stepTitle('Où et quand')).not.toBeVisible()
		await expect
			.element(page.getByText('Le titre doit contenir au moins 3 caractères'))
			.toBeVisible()
	})

	it('moves on once the three fields of the step are valid', async () => {
		renderFlow()
		await describeObject()
		await userEvent.click(advance())

		await expect.element(heading('Où et quand')).toBeVisible()
		await expect.element(stepTitle("L'objet")).not.toBeVisible()
		await expect.element(page.getByText('2 / 3')).toBeVisible()
	})

	it('goes back without losing what was typed', async () => {
		renderFlow()
		await describeObject()
		await userEvent.click(advance())
		await userEvent.click(stepBack())

		await expect.element(heading("L'objet")).toBeVisible()
		await expect.element(title()).toHaveValue('Téléphone Tecno noir')
	})

	it('says the draft is saved as soon as anything is typed', async () => {
		renderFlow()

		await expect.element(draftNotice()).not.toBeInTheDocument()

		await userEvent.fill(title(), 'Sac à dos noir')

		await expect.element(draftNotice()).toBeVisible()
	})

	// The whole point of the draft: an incoming call tears the page down, and a
	// dozen fields with it.
	it('restores an interrupted session at the step it was left on', async () => {
		writePublishDraft({
			values: {
				title: 'Téléphone Tecno noir',
				objectType: 'phone',
				description: 'Coque bleue, écran fissuré en haut à droite.',
				ville: 'Abidjan',
				commune: 'Cocody',
				date: '2026-08-26',
				name: 'Konan',
				whatsapp: '0700000000',
			},
			step: 3,
		})

		renderFlow()

		await expect.element(heading('Comment vous joindre')).toBeVisible()
		await expect.element(page.getByLabelText(/^Votre nom/)).toHaveValue('Konan')
		await expect.element(page.getByText('Cocody, Abidjan')).toBeVisible()
		await expect.element(page.getByText('26 août 2026')).toBeVisible()
	})
})
