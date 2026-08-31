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
) {
	const Stub = createRoutesStub([
		{
			path: '/account/posts',
			Component: () => <ListingCard listing={{ ...LISTING, ...listing }} />,
			action: action as never,
		},
	])
	render(<Stub initialEntries={['/account/posts']} />)
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

		await userEvent.click(
			page.getByRole('button', { name: /Marquer retrouvée/ }),
		)

		expect(success).not.toHaveBeenCalled()
		release()
	})

	it('confirms once the action succeeds', async () => {
		renderCard()

		await userEvent.click(
			page.getByRole('button', { name: /Marquer retrouvée/ }),
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

		await userEvent.click(
			page.getByRole('button', { name: /Marquer retrouvée/ }),
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

		await userEvent.click(
			page.getByRole('button', { name: /Marquer retrouvée/ }),
		)

		await vi.waitFor(() =>
			expect(error).toHaveBeenCalledWith(
				'Impossible de marquer cette annonce retrouvée',
			),
		)
		expect(success).not.toHaveBeenCalled()
	})

	it('reports a failed deletion instead of claiming it worked', async () => {
		renderCard({}, async () => ({ success: false }))

		await userEvent.click(
			page.getByRole('button', { name: "Supprimer l'annonce" }),
		)
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

			await expect
				.element(page.getByRole('link', { name: /Modifier/ }))
				.toHaveAttribute('href', '/account/posts/post-1')
		},
	)

	it.each([
		['active', 'En ligne'],
		['resolved', 'Retrouvée'],
		['expired', 'Archivée'],
	] as const)(
		'says %s as « %s », the words the filters use',
		async (status, label) => {
			renderCard({ status })

			await expect.element(page.getByText(label, { exact: true })).toBeVisible()
		},
	)

	it('agrees the counters in the singular', async () => {
		renderCard({ views: 1, contacts: 1 })

		await expect.element(page.getByText('1 vue', { exact: true })).toBeVisible()
		await expect
			.element(page.getByText('1 contact', { exact: true }))
			.toBeVisible()
	})
})
