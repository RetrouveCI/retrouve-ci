import { createRoutesStub } from 'react-router'
import {
	cleanup,
	page,
	render,
	stopAnimations,
	userEvent,
} from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import type { UserLostItem } from '@/shared/types/lost-item'
import type { ListingMatches } from '../../types/matches'
import { ListingCard } from '../listing-card'

const { success, error } = vi.hoisted(() => ({
	success: vi.fn(),
	error: vi.fn(),
}))

// The `@app/ui/components` barrel pulls sonner's `Toaster` in, so the real
// module has to stay around — only `toast` is swapped.
vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error },
}))

const LISTING: UserLostItem = {
	id: 'post-1',
	title: 'Sac à dos noir',
	description: 'Oublié dans un gbaka',
	location: 'Abidjan, Cocody',
	date: '12 janvier 2026',
	type: 'lost',
	category: 'bag',
	status: 'active',
	moderationStatus: 'published',
	createdAt: '2026-01-12',
	views: 1,
	contacts: 1,
}

type Action = (args: { request: Request }) => unknown

/**
 * `async` on purpose: a route action always crosses the network, so the fetcher
 * really does render its `submitting` state. A synchronous stub would settle
 * inside the batch that submits it, which no deployed action ever does.
 */
function renderCard(
	listing: Partial<UserLostItem> = {},
	action: Action = async () => ({ success: true }) as ActionResult,
	matches?: ListingMatches,
) {
	const Stub = createRoutesStub([
		{
			path: '/account/posts',
			Component: () => (
				<ListingCard listing={{ ...LISTING, ...listing }} matches={matches} />
			),
			action: action as never,
		},
	])
	render(<Stub initialEntries={['/account/posts']} />)
}

const MATCHES: ListingMatches = {
	count: 2,
	items: [
		{
			id: 'found-1',
			title: 'Sac à dos trouvé à Cocody',
			description: 'Ramassé devant la pharmacie',
			location: 'Abidjan, Cocody',
			ville: 'Cocody',
			date: 'Il y a 2 jours',
			type: 'found',
			category: 'bag',
		},
		{
			id: 'found-2',
			title: 'Sac noir sans papiers',
			description: 'Laissé dans un taxi',
			location: 'Abidjan, Cocody',
			ville: 'Cocody',
			date: 'Il y a 4 jours',
			type: 'found',
			category: 'bag',
		},
	],
}

/** Every action lives behind the one 44 px target that replaced four buttons. */
async function openMenu() {
	await userEvent.click(
		page.getByRole('button', { name: 'Actions sur cette annonce' }),
	)
}

beforeEach(() => {
	stopAnimations()
	success.mockReset()
	error.mockReset()
})

afterEach(cleanup)

describe('ListingCard', () => {
	it('announces nothing before the action has answered', async () => {
		let release = () => {}
		const held = new Promise<void>(resolve => {
			release = resolve
		})
		renderCard({}, async () => {
			await held
			return { success: true }
		})

		await openMenu()
		await userEvent.click(
			page.getByRole('button', { name: 'Marquer retrouvée' }),
		)

		expect(success).not.toHaveBeenCalled()
		release()
	})

	it('confirms once the action succeeds', async () => {
		renderCard()

		await openMenu()
		await userEvent.click(
			page.getByRole('button', { name: 'Marquer retrouvée' }),
		)

		await vi.waitFor(() =>
			expect(success).toHaveBeenCalledWith('Annonce marquée retrouvée'),
		)
		expect(error).not.toHaveBeenCalled()
	})

	it('reports the API message when the call fails', async () => {
		renderCard({}, async () => ({
			success: false,
			errors: { root: { message: 'Service indisponible' } },
		}))

		await openMenu()
		await userEvent.click(
			page.getByRole('button', { name: 'Marquer retrouvée' }),
		)

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith('Service indisponible'),
		)
		expect(success).not.toHaveBeenCalled()
	})

	// A field error belongs to no field the card renders, so the action's own
	// wording is unusable here: the card names the action that failed instead.
	it('names the failed action when the error belongs to a field', async () => {
		renderCard({}, async () => ({
			success: false,
			errors: { status: { message: 'Statut invalide' } },
		}))

		await openMenu()
		await userEvent.click(
			page.getByRole('button', { name: 'Marquer retrouvée' }),
		)

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith(
				'Impossible de marquer cette annonce retrouvée',
			),
		)
		expect(success).not.toHaveBeenCalled()
	})

	it('keeps deletion behind a confirmation', async () => {
		renderCard({}, async () => ({ success: false }))

		await openMenu()
		await userEvent.click(
			page.getByRole('button', { name: "Supprimer l'annonce" }),
		)

		expect(error).not.toHaveBeenCalled()

		await userEvent.click(page.getByRole('button', { name: 'Supprimer' }))

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith(
				'Impossible de supprimer cette annonce',
			),
		)
		expect(success).not.toHaveBeenCalled()
	})

	// R12: the front used to hide « Modifier » on anything but a pending listing,
	// where the API only ever checks ownership.
	it.each(['pending', 'published', 'hidden'] as const)(
		'offers Modifier on a %s listing',
		async moderationStatus => {
			renderCard({ moderationStatus })
			await openMenu()

			await expect
				.element(page.getByRole('link', { name: "Modifier l'annonce" }))
				.toHaveAttribute('href', '/account/posts/post-1')
		},
	)

	describe('the five crossings of the two state axes', () => {
		// « Publiée + En ligne » is the normal case, so it carries no exception
		// badge — only the numbers the owner came for.
		it('badges nothing on a published, live listing', async () => {
			renderCard({ views: 48, contacts: 3 })

			await expect
				.element(page.getByText('48 vues', { exact: true }))
				.toBeVisible()
			await expect
				.element(page.getByText('3 personnes vous ont écrit', { exact: true }))
				.toBeVisible()
			expect(page.getByText('En attente').elements()).toHaveLength(0)
			expect(page.getByText('Masquée').elements()).toHaveLength(0)
		})

		it('says why a listing awaiting validation has no audience', async () => {
			renderCard({ moderationStatus: 'pending', views: 0, contacts: 0 })

			await expect
				.element(page.getByText('En attente', { exact: true }))
				.toBeVisible()
			await expect
				.element(
					page.getByText("Pas encore de vue : elle n'est visible que de vous."),
				)
				.toBeVisible()
		})

		it('badges a hidden listing and offers no sharing', async () => {
			renderCard({ moderationStatus: 'hidden' })

			await expect
				.element(page.getByText('Masquée', { exact: true }))
				.toBeVisible()

			await openMenu()
			expect(
				page.getByRole('button', { name: "Partager l'annonce" }).elements(),
			).toHaveLength(0)
		})

		// A listing pulled down without a word leaves nothing to correct.
		it('says why a hidden listing was pulled down', async () => {
			renderCard({
				moderationStatus: 'hidden',
				moderation: { reason: 'document_number_visible' },
			})

			await expect
				.element(page.getByText(/laisse lire un numéro de pièce/))
				.toBeVisible()
			await expect
				.element(page.getByRole('link', { name: "Modifier l'annonce" }))
				.toHaveAttribute('href', '/account/posts/post-1')
		})

		it('reads the note the moderator wrote behind « Autre »', async () => {
			renderCard({
				moderationStatus: 'hidden',
				moderation: { reason: 'other', note: 'La 2e photo montre une CNI.' },
			})

			await expect
				.element(page.getByText('La 2e photo montre une CNI.'))
				.toBeVisible()
		})

		// Hiding without a reason stays possible, and the card must not invent
		// one — but the way to correct it is still offered.
		it('offers the edit without a reason when none was given', async () => {
			renderCard({ moderationStatus: 'hidden' })

			expect(page.getByText(/^Motif/).elements()).toHaveLength(0)
			await expect
				.element(page.getByRole('link', { name: "Modifier l'annonce" }))
				.toBeVisible()
		})

		// The artboard draws none there: frozen history beside « Motif » is noise.
		it('drops the counters on a hidden listing', async () => {
			renderCard({ moderationStatus: 'hidden', views: 12 })

			expect(page.getByText(/12 vues/).elements()).toHaveLength(0)
		})

		it('keeps the counters while a listing is online', async () => {
			renderCard({ moderationStatus: 'published', views: 12 })

			await expect.element(page.getByText(/12 vues/)).toBeVisible()
		})

		it.each([
			['resolved', 'Retrouvée'],
			['expired', 'Archivée'],
		] as const)(
			'offers a closed %s listing its way back',
			async (status, label) => {
				renderCard({ status })

				await expect
					.element(page.getByText(label, { exact: true }))
					.toBeVisible()

				await openMenu()
				await expect
					.element(page.getByRole('button', { name: 'Remettre en ligne' }))
					.toBeVisible()
			},
		)
	})

	it('lets a published listing be shared and viewed', async () => {
		renderCard()
		await openMenu()

		await expect
			.element(page.getByRole('button', { name: "Partager l'annonce" }))
			.toBeVisible()
		await expect
			.element(page.getByRole('link', { name: "Voir l'annonce" }))
			.toHaveAttribute('href', '/posts/post-1')
	})

	it('agrees the counters in the singular', async () => {
		renderCard({ views: 1, contacts: 1 })

		await expect.element(page.getByText('1 vue', { exact: true })).toBeVisible()
		await expect
			.element(page.getByText('1 personne vous a écrit', { exact: true }))
			.toBeVisible()
	})

	it('says plainly when nobody has written', async () => {
		renderCard({ contacts: 0 })

		await expect
			.element(page.getByText('Personne ne vous a écrit', { exact: true }))
			.toBeVisible()
	})

	it('says nothing about matches until there are some', async () => {
		renderCard()

		await expect
			.element(page.getByText('pourraient correspondre'))
			.not.toBeInTheDocument()
	})

	it('names the count and the town when the matches arrive', async () => {
		renderCard({ ville: 'Cocody' }, undefined, MATCHES)

		await expect
			.element(
				page.getByRole('button', {
					name: /2 objets trouvés pourraient correspondre/,
				}),
			)
			.toBeVisible()
		await expect.element(page.getByText('Signalés à Cocody')).toBeVisible()
	})

	it('lists the candidates behind the band', async () => {
		renderCard({}, undefined, MATCHES)

		await userEvent.click(
			page.getByRole('button', {
				name: /2 objets trouvés pourraient correspondre/,
			}),
		)

		await expect
			.element(page.getByRole('link', { name: /Sac à dos trouvé à Cocody/ }))
			.toHaveAttribute('href', '/posts/found-1')
	})

	/** The band counts what the endpoint found; the sheet shows the closest four. */
	it('owns up to the candidates it does not list', async () => {
		renderCard({}, undefined, { ...MATCHES, count: 9 })

		await userEvent.click(
			page.getByRole('button', {
				name: /9 objets trouvés pourraient correspondre/,
			}),
		)

		await expect
			.element(page.getByText('Les 2 plus proches sont affichés.'))
			.toBeVisible()
	})
})
