import { createRoutesStub } from 'react-router'
import { page, render, userEvent } from '@/shared/helpers/testing'
import type { ActionResult } from '@/shared/types/action'
import { MODERATION_REASON_LABELS } from '../../../posts.const'
import type { Post } from '../../../types/posts.types'
import { PostModerationCard } from '../post-moderation-card'
import { PostSummaryCard } from '../post-summary-card'

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
		moderationStatus: 'pending',
		moderationReason: null,
		moderationReasonNote: null,
		resolutionStatus: 'active',
		views: 12,
		contactsCount: 3,
		official: false,
		postedFor: null,
		userId: 'user-1',
		createdAt: '2026-09-06T00:00:00.000Z',
		updatedAt: '2026-09-06T00:00:00.000Z',
		...overrides,
	}
}

describe('PostSummaryCard', () => {
	// The desk's own note, and one a public read never carries.
	it('names who the team holds the object for', async () => {
		render(<PostSummaryCard post={buildPost({ postedFor: 'KOUASSI Jean' })} />)

		await expect
			.element(page.getByText('Déposée pour KOUASSI Jean'))
			.toBeVisible()
	})

	it('says nothing of it when the listing is a visitor’s', async () => {
		render(<PostSummaryCard post={buildPost()} />)

		expect(page.getByText(/Déposée pour/).elements()).toHaveLength(0)
	})
})

describe('PostModerationCard', () => {
	function renderCard(
		post: Post,
		action: (args: { request: Request }) => Promise<ActionResult> = async () =>
			({ success: true }) as ActionResult,
	) {
		const Stub = createRoutesStub([
			{
				path: '/posts/:id',
				Component: () => <PostModerationCard post={post} />,
				action,
			},
		])

		render(<Stub initialEntries={[`/posts/${post.id}`]} />)
	}

	it('publishes with the listing’s id, from the page', async () => {
		const sent: Record<string, unknown>[] = []
		renderCard(buildPost(), async ({ request }) => {
			sent.push(Object.fromEntries(await request.formData()))
			return { success: true } as ActionResult
		})

		await userEvent.click(page.getByRole('button', { name: 'Approuver' }))

		await vi.waitFor(() =>
			expect(sent).toEqual([
				{
					intent: 'moderate',
					id: 'post-1',
					moderationStatus: 'published',
					moderationReason: '',
					moderationReasonNote: '',
				},
			]),
		)
	})

	// Hiding is shown to the poster, so it asks for a reason first.
	it('keeps hiding behind its dialog', async () => {
		const action = vi.fn(async () => ({ success: true }) as ActionResult)
		renderCard(buildPost({ moderationStatus: 'published' }), action)

		await userEvent.click(page.getByRole('button', { name: 'Masquer…' }))

		await expect
			.element(page.getByRole('dialog', { name: /Masquer/ }))
			.toBeVisible()
		expect(action).not.toHaveBeenCalled()
	})

	// The decision already taken, in the moderator's words: a second moderator
	// must not have to guess why a listing is down.
	it('recalls why the listing was hidden', async () => {
		renderCard(
			buildPost({
				moderationStatus: 'hidden',
				moderationReason: 'unclear_photo',
				moderationReasonNote: 'La deuxième photo est floue',
			}),
		)

		await expect
			.element(page.getByText(MODERATION_REASON_LABELS.unclear_photo))
			.toBeVisible()
		await expect
			.element(page.getByText('La deuxième photo est floue'))
			.toBeVisible()
	})

	it('offers no decision the listing already carries', async () => {
		renderCard(buildPost({ moderationStatus: 'published' }))

		expect(page.getByRole('button', { name: 'Approuver' }).elements()).toEqual(
			[],
		)
	})
})
