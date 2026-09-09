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

type Stickers = { code: string; label: string }[]

function renderFlow(contactName = '', stickers: Stickers = []) {
	const Stub = createRoutesStub([
		{
			path: '/publish/lost',
			Component: () => (
				<PublishFlow
					type="lost"
					contactName={contactName}
					stickers={stickers}
				/>
			),
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

describe('the contact name the account already knows', () => {
	it('opens step 3 on it, still editable', async () => {
		renderFlow('Konan')
		await describeObject()
		await userEvent.click(advance())
		await userEvent.click(advance())

		await expect.element(page.getByLabelText(/^Votre nom/)).toHaveValue('Konan')
	})

	// Prefilling is not typing: the bar would otherwise claim a saved draft on a
	// form nobody has touched.
	it('does not read as a draft on its own', async () => {
		renderFlow('Konan')

		await expect.element(heading("L'objet")).toBeVisible()
		expect(draftNotice().elements()).toHaveLength(0)
	})
})

// R45. `Documents` leads, but is not preselected: it is the one category that
// takes the photo picker away, so a listing left on it would publish with none.
describe('PublishFlow — choosing a category', () => {
	const pill = (name: string) => page.getByRole('button', { name, exact: true })

	const pills = () =>
		page
			.getByRole('group', { name: "Type d'objet" })
			.element()
			.querySelectorAll('button')

	it('leads with Documents', async () => {
		renderFlow()

		await expect.element(pill('Documents')).toBeVisible()
		expect(pills()[0]?.textContent).toBe('Documents')
	})

	it('preselects none of them', async () => {
		renderFlow()

		await expect.element(pill('Documents')).toBeVisible()

		const pressed = [...pills()].filter(
			button => button.getAttribute('aria-pressed') === 'true',
		)

		expect(pressed).toEqual([])
		expect(page.getByText('Aucune photo').query()).toBeNull()
	})

	it('refuses to move on until one is chosen', async () => {
		renderFlow()

		await userEvent.fill(title(), 'Téléphone Tecno noir')
		await userEvent.click(advance())

		await expect
			.element(page.getByText("Sélectionnez un type d'objet"))
			.toBeVisible()
	})
})

/** A9: the field exists only where it has something to offer. */
describe('PublishFlow — naming a sticker', () => {
	const label = /Cet objet porte-t-il un de vos stickers/
	const picker = () => page.getByRole('combobox', { name: label })

	it('draws no picker for an account with no activated sticker', async () => {
		renderFlow()

		await expect.element(title()).toBeVisible()
		expect(picker().query()).toBeNull()
	})

	it('offers the stickers by their name, none chosen to begin with', async () => {
		renderFlow('', [{ code: 'RCI-ABC123', label: 'Clés de la maison' }])

		await expect.element(picker()).toHaveTextContent('Aucun sticker')

		await userEvent.click(picker())

		await expect
			.element(page.getByRole('option', { name: 'Clés de la maison' }))
			.toBeVisible()
	})

	it('carries the chosen code into the submitted body', async () => {
		renderFlow('', [{ code: 'RCI-ABC123', label: 'Clés de la maison' }])

		await userEvent.click(picker())
		await userEvent.click(
			page.getByRole('option', { name: 'Clés de la maison' }),
		)

		await expect.element(picker()).toHaveTextContent('Clés de la maison')
	})
})
