import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import type { LostItemType } from '@/shared/types/lost-item'
import { writePublishDraft } from '../../helpers/publish-draft'
import { PublishFlow } from '../publish-flow'

function renderFlow(type: LostItemType = 'lost') {
	const Stub = createRoutesStub([
		{
			path: `/publish/${type}`,
			Component: () => <PublishFlow type={type} />,
			action: () => ({ success: true }),
		},
		{ path: '/publish/matches', loader: () => ({ items: [] }) },
	])

	render(<Stub initialEntries={[`/publish/${type}`]} />)
}

const pieceBlock = () => page.getByText('La pièce', { exact: true })
const holder = () => page.getByLabelText(/^Nom du titulaire/)
const numberToggle = () =>
	page.getByRole('button', { name: 'Je connais le numéro' })

async function chooseDocuments() {
	await userEvent.click(page.getByRole('button', { name: 'Documents' }))
}

async function chooseType(label: string) {
	await chooseDocuments()
	await userEvent.click(page.getByRole('combobox', { name: /Type de pièce/ }))
	await userEvent.click(page.getByRole('option', { name: label }))
}

beforeEach(() => {
	stopAnimations()
	localStorage.clear()
})

afterEach(() => {
	cleanup()
})

describe('declaring a piece of ID', () => {
	it('opens the block only once « Documents » is the category', async () => {
		renderFlow()

		await expect.element(pieceBlock()).not.toBeInTheDocument()

		await chooseDocuments()

		await expect.element(pieceBlock()).toBeVisible()
	})

	// Nothing is asked about the holder until the piece says what it is: the
	// fields that follow depend on the type.
	it('asks for the holder only once a type is chosen', async () => {
		renderFlow()
		await chooseDocuments()

		await expect.element(holder()).not.toBeInTheDocument()

		await chooseType("Carte nationale d'identité")

		await expect.element(holder()).toBeVisible()
	})

	it('names the number after the piece it belongs to', async () => {
		renderFlow('found')
		await chooseType('Permis de conduire')

		await expect.element(page.getByLabelText(/^Numéro du permis/)).toBeVisible()
	})

	// The issuer is the bank or the insurer; a CNI is issued by the State, which
	// names no institution.
	it('asks for the issuer only where one exists', async () => {
		renderFlow('found')
		await chooseType("Carte nationale d'identité")

		await expect.element(page.getByLabelText(/^Banque/)).not.toBeInTheDocument()

		await chooseType('Carte bancaire')

		await expect.element(page.getByLabelText(/^Banque/)).toBeVisible()
		await expect.element(page.getByLabelText(/derniers chiffres/)).toBeVisible()
	})

	// The piece is in hand on the « found » side, so the field leads there.
	it('puts the number forward on a find', async () => {
		renderFlow('found')
		await chooseType('Passeport')

		await expect.element(numberToggle()).not.toBeInTheDocument()
		await expect.element(page.getByText(/Recopiez-le tel qu/)).toBeVisible()
	})

	// On the « lost » side an empty number field would read as a condition for
	// declaring, which is exactly what whoever lost their card cannot meet.
	it('folds the number behind a disclosure on a loss', async () => {
		renderFlow('lost')
		await chooseType('Passeport')

		await expect.element(numberToggle()).toBeVisible()
		await expect
			.element(page.getByLabelText(/^Numéro du passeport/))
			.not.toBeInTheDocument()

		await userEvent.click(numberToggle())

		await expect
			.element(page.getByLabelText(/^Numéro du passeport/))
			.toBeVisible()
	})

	// A field that asks for an identity number without justifying itself will
	// not be filled in — or will be filled in by the wrong people.
	it('says why the number is asked, where it is asked', async () => {
		renderFlow('found')
		await chooseType("Carte d'assurance")

		await expect
			.element(page.getByText(/n'apparaît sur aucune page publique/))
			.toBeVisible()
	})

	it('replaces the photo picker with the reason there is none', async () => {
		renderFlow('found')

		await expect.element(page.getByText('Aucune photo')).not.toBeInTheDocument()

		await chooseDocuments()

		await expect.element(page.getByText('Aucune photo')).toBeVisible()
		await expect
			.element(page.getByText(/Facultatif · 5 max\./))
			.not.toBeInTheDocument()
	})

	// The type and the holder say more than a paragraph, so the floor the other
	// categories carry stops applying.
	it('stops requiring a description once the piece is named', async () => {
		renderFlow()
		await chooseType("Carte nationale d'identité")

		await expect.element(page.getByText('0 / 20 min.')).toBeVisible()

		await userEvent.fill(holder(), 'KOUASSI Jean')

		await expect.element(page.getByText('0 / 20 min.')).not.toBeInTheDocument()
	})

	// The piece is what defines the listing once there is no photo and no
	// description, so the last screen before publishing has to name it.
	it('names the piece in the summary', async () => {
		writePublishDraft({
			values: {
				title: 'CNI trouvée à Yopougon',
				objectType: 'documents',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
				ville: 'Abidjan',
				commune: 'Yopougon',
				date: '2026-09-01',
			},
			step: 3,
		})

		renderFlow('found')

		await expect.element(page.getByText('Récapitulatif')).toBeVisible()
		await expect.element(page.getByText('Pièce', { exact: true })).toBeVisible()
	})

	// Radix answers once with an empty value as it mounts a `Select`; taken at
	// face value that emptied the field the draft had just restored — and the
	// disclosure has to come back open, or the number reads as lost.
	it('keeps the piece a restored draft carried', async () => {
		writePublishDraft({
			values: {
				title: 'CNI perdue à Yopougon',
				objectType: 'documents',
				documentType: 'national_id',
				documentHolderName: 'KOUASSI Jean',
				documentNumber: 'CI0012345678',
			},
			step: 1,
		})

		renderFlow('lost')

		await expect.element(page.getByText('Brouillon enregistré')).toBeVisible()
		await expect
			.element(page.getByRole('combobox', { name: /Type de pièce/ }))
			.toHaveTextContent("Carte nationale d'identité")
		await expect.element(holder()).toHaveValue('KOUASSI Jean')
		await expect.element(numberToggle()).not.toBeInTheDocument()
		await expect
			.element(page.getByLabelText(/^Numéro de la carte/))
			.toHaveValue('CI0012345678')
	})
})
