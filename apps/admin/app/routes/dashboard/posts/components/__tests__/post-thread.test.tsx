import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { PostThread } from '../post-thread'
import type { Post, PostComment } from '../../types/posts.types'

function buildPost(overrides: Partial<Post> = {}): Post {
	return {
		id: 'post-1',
		type: 'lost',
		category: 'phone',
		title: 'iPhone 13 perdu',
		description: 'Coque noire',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: '2026-09-06T00:00:00.000Z',
		contactName: 'Koffi Yao',
		contactWhatsapp: '+2250700000000',
		photos: [],
		documentType: null,
		documentHolderName: null,
		documentNumber: null,
		documentIssuer: null,
		moderationStatus: 'published',
		moderationReason: null,
		moderationReasonNote: null,
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		official: false,
		postedFor: null,
		userId: 'user-1',
		createdAt: '2026-09-06T00:00:00.000Z',
		updatedAt: '2026-09-06T00:00:00.000Z',
		...overrides,
	}
}

function buildComment(overrides: Partial<PostComment> = {}): PostComment {
	return {
		id: 'comment-1',
		lostItemId: 'post-1',
		authorSide: 'admin',
		body: 'Ajoutez une photo du dos',
		createdAt: '2026-09-08T15:04:00.000Z',
		readAt: null,
		...overrides,
	}
}

const ok = () => ({ success: true }) as ActionResult

function renderThread({
	comments = [],
	action = vi.fn(ok),
}: {
	comments?: PostComment[] | null
	action?: (args: { request: Request }) => unknown
} = {}) {
	const post = buildPost()
	const Stub = createRoutesStub([
		{ path: '/posts', Component: () => <PostThread post={post} /> },
		{
			path: '/posts/:id/comments',
			loader: () => ({ postId: post.id, comments }),
			action,
		},
	])

	render(<Stub initialEntries={['/posts']} />)
}

async function fieldsOf(request: Request) {
	return Object.fromEntries(await request.formData())
}

const composer = () => page.getByLabelText('Message au posteur')

describe('PostThread', () => {
	it('signs the desk as the team and the poster by their name', async () => {
		renderThread({
			comments: [
				buildComment(),
				buildComment({
					id: 'comment-2',
					authorSide: 'owner',
					body: 'Je l’ajoute ce soir',
					readAt: '2026-09-08T18:00:00.000Z',
				}),
			],
		})

		await expect
			.element(page.getByText('Équipe RetrouveCI'))
			.toBeInTheDocument()
		await expect.element(page.getByText('Koffi Yao')).toBeInTheDocument()
		await expect
			.element(page.getByText('Je l’ajoute ce soir'))
			.toBeInTheDocument()
	})

	it('says when nothing has been written yet', async () => {
		renderThread()

		await expect
			.element(page.getByText('Aucun échange pour l’instant.'))
			.toBeInTheDocument()
	})

	it('says when the thread cannot be read, rather than showing it empty', async () => {
		renderThread({ comments: null })

		await expect
			.element(page.getByText('Impossible de charger les échanges.'))
			.toBeInTheDocument()
	})

	it('refuses an empty message without reaching the action', async () => {
		const action = vi.fn(ok)
		renderThread({ action })

		await expect
			.element(page.getByText('Aucun échange pour l’instant.'))
			.toBeInTheDocument()
		await userEvent.click(page.getByRole('button', { name: 'Envoyer' }))

		await expect
			.element(page.getByText('Le message ne peut pas être vide'))
			.toBeInTheDocument()
		expect(action).not.toHaveBeenCalled()
	})

	it('sends the comment intent, then clears the field', async () => {
		const sent: Record<string, unknown>[] = []
		renderThread({
			action: async ({ request }) => {
				sent.push(await fieldsOf(request))
				return ok()
			},
		})

		await userEvent.fill(composer(), 'Précisez la commune')
		await userEvent.click(page.getByRole('button', { name: 'Envoyer' }))

		await vi.waitFor(() =>
			expect(sent).toEqual([
				{ intent: 'comment', body: 'Précisez la commune' },
			]),
		)
		await expect.element(composer()).toHaveValue('')
	})

	it('marks the poster’s unread reply read when the thread opens', async () => {
		const sent: Record<string, unknown>[] = []
		renderThread({
			comments: [buildComment({ authorSide: 'owner' })],
			action: async ({ request }) => {
				sent.push(await fieldsOf(request))
				return ok()
			},
		})

		await vi.waitFor(() => expect(sent).toContainEqual({ intent: 'read' }))
	})

	// The desk's own unread words are the poster's to read, not the desk's.
	it('leaves a thread alone when only the desk’s message is unread', async () => {
		const action = vi.fn(ok)
		renderThread({ comments: [buildComment()], action })

		await expect
			.element(page.getByText('Ajoutez une photo du dos'))
			.toBeInTheDocument()
		await new Promise(resolve => setTimeout(resolve, 100))

		expect(action).not.toHaveBeenCalled()
	})

	// The system account owns a team listing, and nobody reads for it — so the
	// thread must not even ask the API for one.
	it('opens no thread on a team listing', async () => {
		const loader = vi.fn(() => ({ postId: 'post-1', comments: [] }))
		const post = buildPost({ official: true })
		const Stub = createRoutesStub([
			{ path: '/posts', Component: () => <PostThread post={post} /> },
			{ path: '/posts/:id/comments', loader },
		])

		render(<Stub initialEntries={['/posts']} />)

		await new Promise(resolve => setTimeout(resolve, 100))

		expect(page.getByText('Échanges avec le posteur').elements()).toHaveLength(
			0,
		)
		expect(loader).not.toHaveBeenCalled()
	})
})
