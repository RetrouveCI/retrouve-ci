import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository as buildLostItemRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import { LostItemForbiddenError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import {
	buildListingComment,
	buildRepository,
	DESK,
	POSTER,
} from '../../__tests__/listing-comment.fixture'
import type { ListingCommentRepository } from '../../repository/listing-comment.repository'
import { PostListingCommentUseCase } from '../post-listing-comment.use-case'

const BODY = 'Ajoutez une photo du dos'

describe('PostListingCommentUseCase', () => {
	let repository: ListingCommentRepository
	let lostItems: LostItemRepository
	let notifier: CreateNotificationUseCase
	let useCase: PostListingCommentUseCase

	beforeEach(() => {
		repository = buildRepository()
		lostItems = buildLostItemRepository()
		notifier = {
			execute: vi.fn().mockResolvedValue(undefined),
		} as unknown as CreateNotificationUseCase

		vi.mocked(lostItems.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1', title: 'iPhone 13 perdu' }),
		)
		vi.mocked(repository.create).mockImplementation(async data =>
			buildListingComment(data),
		)

		useCase = new PostListingCommentUseCase(repository, lostItems, notifier)
	})

	describe('from the desk', () => {
		const post = () =>
			useCase.execute({
				lostItemId: 'lost-item-1',
				authorId: 'admin-1',
				scope: DESK,
				body: BODY,
			})

		it('writes on the admin side', async () => {
			await post()

			expect(repository.create).toHaveBeenCalledWith({
				lostItemId: 'lost-item-1',
				authorId: 'admin-1',
				authorSide: 'admin',
				body: BODY,
			})
		})

		it('tells the poster, on the page where they answer', async () => {
			await post()

			expect(notifier.execute).toHaveBeenCalledWith({
				type: 'listing_commented',
				title: "L'équipe a commenté votre annonce",
				message: `« iPhone 13 perdu » : ${BODY}`,
				link: '/account/posts/lost-item-1',
				userId: 'user-1',
			})
		})
	})

	describe('from the poster', () => {
		const post = () =>
			useCase.execute({
				lostItemId: 'lost-item-1',
				authorId: 'user-1',
				scope: POSTER,
				body: BODY,
			})

		it('writes on the owner side', async () => {
			await post()

			expect(repository.create).toHaveBeenCalledWith(
				expect.objectContaining({ authorId: 'user-1', authorSide: 'owner' }),
			)
		})

		it('tells the desk, and no one in particular', async () => {
			await post()

			const [call] = vi.mocked(notifier.execute).mock.calls

			expect(call?.[0]).toMatchObject({
				type: 'listing_replied',
				link: '/posts',
			})
			expect(call?.[0]).not.toHaveProperty('userId')
		})

		it('refuses a listing the poster does not own, writing nothing', async () => {
			await expect(
				useCase.execute({
					lostItemId: 'lost-item-1',
					authorId: 'user-2',
					scope: { side: 'owner', userId: 'user-2' },
					body: BODY,
				}),
			).rejects.toThrow(LostItemForbiddenError)
			expect(repository.create).not.toHaveBeenCalled()
			expect(notifier.execute).not.toHaveBeenCalled()
		})
	})

	it('answers the comment without its author’s id', async () => {
		const comment = await useCase.execute({
			lostItemId: 'lost-item-1',
			authorId: 'admin-1',
			scope: DESK,
			body: BODY,
		})

		expect(comment).toMatchObject({ authorSide: 'admin', body: BODY })
		expect(comment).not.toHaveProperty('authorId')
	})

	// The comment exists by the time the notice is raised: failing it must not
	// answer 500 to someone whose words were recorded, and who would send again.
	it('keeps the comment when the notice fails', async () => {
		vi.mocked(notifier.execute).mockRejectedValue(new Error('redis down'))

		await expect(
			useCase.execute({
				lostItemId: 'lost-item-1',
				authorId: 'user-1',
				scope: POSTER,
				body: BODY,
			}),
		).resolves.toMatchObject({ body: BODY })
	})
})
