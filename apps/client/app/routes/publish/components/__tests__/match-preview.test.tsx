import { createRoutesStub } from 'react-router'
import { cleanup, page, render } from '@/shared/helpers/testing'
import type { LostItem } from '@/shared/types/lost-item'
import { MatchPreview } from '../match-preview'

const MATCH: LostItem = {
	id: 'post-1',
	title: 'Téléphone Android noir',
	description: 'Trouvé dans un gbaka.',
	location: 'Cocody, Abidjan',
	date: 'hier',
	type: 'found',
	category: 'phone',
}

function renderPreview(
	items: LostItem[] | null,
	criteria: { objectType?: string; ville?: string } = {},
) {
	const objectType = criteria.objectType ?? 'phone'
	const ville = criteria.ville ?? 'Abidjan'

	const Stub = createRoutesStub([
		{
			path: '/',
			Component: () => (
				<MatchPreview type="lost" objectType={objectType} ville={ville} />
			),
		},
		{ path: '/publish/matches', loader: () => ({ items }) },
	])

	render(<Stub initialEntries={['/']} />)
}

afterEach(() => {
	cleanup()
})

describe('the step-2 matches', () => {
	it('says how many objects already found look like the description', async () => {
		renderPreview([MATCH])

		await expect
			.element(page.getByText('1 objet déjà trouvé vous ressemble'))
			.toBeVisible()
		await expect
			.element(page.getByRole('link', { name: /Téléphone Android noir/ }))
			.toHaveAttribute('href', '/posts/post-1')
	})

	// The verb agrees with the count and the participle with the noun: a single
	// plural flag spelled « vous ressembles ».
	it('agrees the whole sentence when there are several', async () => {
		renderPreview([
			MATCH,
			{ ...MATCH, id: 'post-2', title: 'Tecno Spark gris' },
		])

		await expect
			.element(page.getByText('2 objets déjà trouvés vous ressemblent'))
			.toBeVisible()
	})

	it('tells an empty answer apart from a failed one', async () => {
		renderPreview([])

		await expect
			.element(page.getByText(/Aucun objet déjà trouvé ne correspond/))
			.toBeVisible()
	})

	// Read as « aucune correspondance », an unreachable API would hand the poster
	// the reassuring answer on no evidence at all.
	it('admits it when the search could not run', async () => {
		renderPreview(null)

		await expect
			.element(page.getByText(/Impossible de vérifier les correspondances/))
			.toBeVisible()
	})

	it('asks nothing until it has both criteria', async () => {
		renderPreview([MATCH], { ville: '' })

		await expect
			.element(page.getByText(/vous ressemble/))
			.not.toBeInTheDocument()
	})
})
