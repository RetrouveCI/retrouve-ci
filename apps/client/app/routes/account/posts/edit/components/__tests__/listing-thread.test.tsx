import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import type { ListingComment } from '../../../types/thread'
import { ListingThread } from '../listing-thread'

const { success } = vi.hoisted(() => ({ success: vi.fn() }))

// The `@app/ui/components` barrel pulls sonner's `Toaster` in, so the real
// module has to stay around — only `toast` is swapped.
vi.mock('sonner', async importOriginal => ({
	...(await importOriginal<typeof import('sonner')>()),
	toast: { success, error: vi.fn() },
}))

function buildComment(overrides: Partial<ListingComment> = {}): ListingComment {
	return {
		id: 'comment-1',
		lostItemId: 'post-1',
		authorSide: 'admin',
		body: 'Ajoutez une photo du dos',
		createdAt: new Date().toISOString(),
		readAt: '2026-09-08T18:00:00.000Z',
		...overrides,
	}
}

const ok = async () => ({ success: true }) as ActionResult

function renderThread({
	thread = [buildComment()],
	action = vi.fn(ok),
}: {
	thread?: ListingComment[] | null
	action?: (args: { request: Request }) => unknown
} = {}) {
	const Stub = createRoutesStub([
		{
			path: '/account/posts/:id',
			Component: () => (
				<>
					<p>Modifier l’annonce</p>
					<ListingThread
						listingId="post-1"
						thread={thread}
						accentColor="var(--primary-green)"
					/>
				</>
			),
		},
		{ path: '/account/posts/:id/comments', action: action as never },
	])

	render(<Stub initialEntries={['/account/posts/post-1']} />)
}

async function fieldsOf(request: Request) {
	return Object.fromEntries(await request.formData())
}

const reply = () => page.getByLabelText('Votre réponse')
const send = () => page.getByRole('button', { name: 'Envoyer ma réponse' })

describe('ListingThread', () => {
	// A poster answers a suggestion; an empty thread is not an invitation.
	it('draws nothing until the team has written', async () => {
		renderThread({ thread: [] })

		await expect.element(page.getByText('Modifier l’annonce')).toBeVisible()
		expect(page.getByText('Échanges avec l’équipe').elements()).toHaveLength(0)
	})

	it('says when the thread cannot be read', async () => {
		renderThread({ thread: null })

		await expect
			.element(page.getByText(/Impossible de charger vos échanges/))
			.toBeVisible()
	})

	it('signs the team as the team, and the poster as « Vous »', async () => {
		renderThread({
			thread: [
				buildComment(),
				buildComment({
					id: 'comment-2',
					authorSide: 'owner',
					body: 'Je l’ajoute ce soir',
				}),
			],
		})

		await expect.element(page.getByText('Équipe RetrouveCI')).toBeVisible()
		await expect.element(page.getByText('Vous', { exact: true })).toBeVisible()
		await expect.element(page.getByText('Je l’ajoute ce soir')).toBeVisible()
	})

	it('refuses an empty reply without reaching the action', async () => {
		const action = vi.fn(ok)
		renderThread({ action })

		await userEvent.click(send())

		await expect
			.element(page.getByText('Le message ne peut pas être vide'))
			.toBeVisible()
		expect(action).not.toHaveBeenCalled()
	})

	it('sends the reply, then clears the field and says so', async () => {
		const sent: Record<string, unknown>[] = []
		renderThread({
			action: async ({ request }) => {
				sent.push(await fieldsOf(request))
				return ok()
			},
		})

		await userEvent.fill(reply(), 'La photo est ajoutée')
		await userEvent.click(send())

		await vi.waitFor(() =>
			expect(sent).toEqual([{ intent: 'reply', body: 'La photo est ajoutée' }]),
		)
		await expect.element(reply()).toHaveValue('')
		expect(success).toHaveBeenCalledWith('Réponse envoyée à l’équipe')
	})

	it('marks the team’s unread message read when the page opens', async () => {
		const sent: Record<string, unknown>[] = []
		renderThread({
			thread: [buildComment({ readAt: null })],
			action: async ({ request }) => {
				sent.push(await fieldsOf(request))
				return ok()
			},
		})

		await vi.waitFor(() => expect(sent).toContainEqual({ intent: 'read' }))
	})

	// The poster's own words are the team's to read.
	it('leaves the thread alone when only the poster’s reply is unread', async () => {
		const action = vi.fn(ok)
		renderThread({
			thread: [
				buildComment(),
				buildComment({ id: 'comment-2', authorSide: 'owner', readAt: null }),
			],
			action,
		})

		await expect.element(page.getByText('Équipe RetrouveCI')).toBeVisible()
		await new Promise(resolve => setTimeout(resolve, 100))

		expect(action).not.toHaveBeenCalled()
	})
})
