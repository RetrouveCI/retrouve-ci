import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import { NewPostForm } from '../new-post-form'

function renderForm() {
	const Stub = createRoutesStub([
		{ path: '/', Component: NewPostForm, action: () => ({ success: true }) },
	])
	render(<Stub initialEntries={['/']} />)
}

const combobox = (name: RegExp) => page.getByRole('combobox', { name })
const city = () => combobox(/^Ville/)
const commune = () => combobox(/^Commune/)

async function pick(trigger: ReturnType<typeof combobox>, option: string) {
	await trigger.click()
	await page.getByRole('option', { name: option, exact: true }).click()
}

afterEach(cleanup)

// The same selects as the public form, so a listing filed at the desk carries
// the cities, communes and institutions a visitor's would.
describe('the team publication form', () => {
	it('keeps the commune closed outside Abidjan', async () => {
		renderForm()

		await expect.element(commune()).toBeDisabled()
		await pick(city(), 'Abidjan')
		await expect.element(commune()).toBeEnabled()
	})

	it('clears the commune when the city changes', async () => {
		renderForm()

		await pick(city(), 'Abidjan')
		await pick(commune(), 'Cocody')
		await pick(city(), 'Bouaké')

		await expect.element(commune()).toHaveTextContent('Abidjan seulement')
	})

	it('offers the banks for a bank card, and free text behind « Autre »', async () => {
		renderForm()

		await page
			.getByRole('checkbox', { name: 'L’objet contient une pièce d’identité' })
			.click()
		await pick(combobox(/^Type de pièce/), 'Carte bancaire')

		await combobox(/^Banque/).click()
		await expect
			.element(page.getByRole('option', { name: 'Ecobank' }))
			.toBeVisible()
		await page.getByRole('option', { name: 'Autre — je saisis le nom' }).click()

		await expect
			.element(page.getByRole('textbox', { name: 'Banque' }))
			.toBeVisible()
	})
})
