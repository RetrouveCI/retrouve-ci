import { createRoutesStub } from 'react-router'
import { page, render } from '@/shared/helpers/testing'
import { PostDetailDialog } from '../post-detail-dialog'
import type { Post } from '../../types/posts.types'

function buildPost(overrides: Partial<Post> = {}): Post {
	return {
		id: 'post-1',
		type: 'found',
		category: 'documents',
		title: 'CNI trouvée à Cocody',
		description: 'Trouvée devant la pharmacie',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: '2026-01-15T00:00:00.000Z',
		contactName: 'Jean Dupont',
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
		createdAt: '2026-01-15T00:00:00.000Z',
		updatedAt: '2026-01-15T00:00:00.000Z',
		...overrides,
	}
}

function renderDialog(post: Post) {
	const Stub = createRoutesStub([
		{
			path: '/posts',
			Component: () => (
				<PostDetailDialog
					post={post}
					open
					onOpenChange={() => {}}
					onModerate={() => {}}
					onHide={() => {}}
				/>
			),
		},
		{
			path: '/posts/:id/comments',
			loader: () => ({ postId: post.id, comments: [] }),
		},
	])

	render(<Stub initialEntries={['/posts']} />)
}

describe('PostDetailDialog', () => {
	it('opens the thread with the poster on a visitor’s listing', async () => {
		renderDialog(buildPost())

		await expect
			.element(page.getByText('Échanges avec le posteur'))
			.toBeInTheDocument()
	})

	// The system account owns a team listing, and nobody reads for it.
	it('opens no thread on a team listing', async () => {
		renderDialog(buildPost({ official: true }))

		await expect
			.element(page.getByText('Équipe RetrouveCI'))
			.toBeInTheDocument()
		expect(page.getByText('Échanges avec le posteur').elements()).toHaveLength(
			0,
		)
	})
})
