import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import OfflinePage from '../_index'

const { listingsAvailableOffline, readPublishDraft } = vi.hoisted(() => ({
	listingsAvailableOffline: vi.fn(),
	readPublishDraft: vi.fn(),
}))

vi.mock('@/shared/helpers/offline-cache', () => ({ listingsAvailableOffline }))
vi.mock('@/routes/publish/helpers/publish-draft', () => ({ readPublishDraft }))

function renderPage(url = '/offline') {
	const Stub = createRoutesStub([
		{ path: '/offline', Component: OfflinePage },
		{ path: '/posts/:id', Component: () => <p>annonce</p> },
	])
	render(<Stub initialEntries={[url]} />)
}

const LISTING = {
	id: 'abc-123',
	title: 'Téléphone Tecno noir',
	location: 'Cocody, Abidjan',
}

beforeEach(() => {
	listingsAvailableOffline.mockReset().mockResolvedValue([])
	readPublishDraft.mockReset().mockReturnValue(null)
})

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
})

describe('the offline page', () => {
	it('says what happened and what is still readable', async () => {
		renderPage()

		await expect
			.element(page.getByText("Pas de réseau pour l'instant"))
			.toBeVisible()
		await expect
			.element(page.getByText('Disponible hors connexion'))
			.toBeVisible()
	})

	it('offers a way to try again', async () => {
		renderPage()

		await expect
			.element(page.getByRole('button', { name: 'Réessayer' }))
			.toBeVisible()
	})

	it('lists a listing the cache holds, and links to it', async () => {
		listingsAvailableOffline.mockResolvedValue([LISTING])
		renderPage()

		await expect
			.element(page.getByRole('link', { name: /Téléphone Tecno noir/ }))
			.toHaveAttribute('href', '/posts/abc-123')
	})

	it('names the place, so the listing is recognisable', async () => {
		listingsAvailableOffline.mockResolvedValue([LISTING])
		renderPage()

		await expect.element(page.getByText('Cocody, Abidjan')).toBeVisible()
	})

	it('says so when this device has read nothing yet', async () => {
		renderPage()

		await expect
			.element(page.getByText(/Aucune annonce n'a encore été consultée/))
			.toBeVisible()
	})

	it('says nothing about a draft when there is none', async () => {
		renderPage()
		await expect
			.element(page.getByText('Disponible hors connexion'))
			.toBeVisible()

		expect(page.getByText(/brouillon/).elements()).toHaveLength(0)
	})

	it('reassures about a draft, without promising to post it', async () => {
		readPublishDraft.mockReturnValue({ values: { title: 'a' }, step: 1 })
		renderPage()

		await expect
			.element(
				page.getByText(
					/Votre brouillon d'annonce est conservé\. Vous pourrez le publier dès le retour du réseau\./,
				),
			)
			.toBeVisible()
	})
})
