import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ListingThreadForbiddenError } from '@/domains/listing-comments/errors/listing-comment.errors'
import type { GetListingThreadUseCase } from '@/domains/listing-comments/use-cases/get-listing-thread.use-case'
import type { GetUnreadListingThreadsUseCase } from '@/domains/listing-comments/use-cases/get-unread-listing-threads.use-case'
import type { MarkListingThreadReadUseCase } from '@/domains/listing-comments/use-cases/mark-listing-thread-read.use-case'
import type { PostListingCommentUseCase } from '@/domains/listing-comments/use-cases/post-listing-comment.use-case'
import { AccountBudgetExceededError } from '@/shared/rate-limit/account-budget.error'
import type { AccountBudget } from '@/shared/rate-limit/account-budget.service'
import { LISTING_COMMENT_PER_USER } from '@/shared/rate-limit/rate-limit.policy'
import { ListingCommentsController } from '../listing-comments.controller'

const poster = { user: { id: 'user-1', role: 'user' } } as never
const admin = { user: { id: 'admin-1', role: 'admin' } } as never

const POSTER_SCOPE = { side: 'owner', userId: 'user-1' }
const DESK_SCOPE = { side: 'admin' }

function buildUseCase<T>(): T {
	return { execute: vi.fn() } as unknown as T
}

describe('ListingCommentsController', () => {
	let getThread: GetListingThreadUseCase
	let getUnread: GetUnreadListingThreadsUseCase
	let postComment: PostListingCommentUseCase
	let markRead: MarkListingThreadReadUseCase
	let accountBudget: AccountBudget
	let controller: ListingCommentsController

	beforeEach(() => {
		getThread = buildUseCase<GetListingThreadUseCase>()
		getUnread = buildUseCase<GetUnreadListingThreadsUseCase>()
		postComment = buildUseCase<PostListingCommentUseCase>()
		markRead = buildUseCase<MarkListingThreadReadUseCase>()
		accountBudget = { require: vi.fn() } as unknown as AccountBudget
		controller = new ListingCommentsController(
			getThread,
			getUnread,
			postComment,
			markRead,
			accountBudget,
		)
	})

	describe('the scope a call reads in', () => {
		it('is the poster’s own on the public app', async () => {
			await controller.getThread(poster, 'public', 'lost-item-1')

			expect(getThread.execute).toHaveBeenCalledWith({
				lostItemId: 'lost-item-1',
				scope: POSTER_SCOPE,
			})
		})

		it('is the desk’s for an administrator on the backoffice', async () => {
			await controller.listUnread(admin, 'admin')

			expect(getUnread.execute).toHaveBeenCalledWith(DESK_SCOPE)
		})

		it('is refused to a backoffice session without the role', () => {
			expect(() =>
				controller.getThread(poster, 'admin', 'lost-item-1'),
			).toThrow(ListingThreadForbiddenError)
			expect(getThread.execute).not.toHaveBeenCalled()
		})

		it('is the same when marking a thread read', async () => {
			await controller.markRead(poster, 'public', 'lost-item-1')

			expect(markRead.execute).toHaveBeenCalledWith({
				lostItemId: 'lost-item-1',
				scope: POSTER_SCOPE,
			})
		})
	})

	describe('reply', () => {
		it('charges the poster’s own ceiling before writing', async () => {
			await controller.reply(poster, 'public', 'lost-item-1', { body: 'Voilà' })

			expect(accountBudget.require).toHaveBeenCalledWith(
				LISTING_COMMENT_PER_USER,
				'user-1',
			)
			expect(postComment.execute).toHaveBeenCalledWith({
				lostItemId: 'lost-item-1',
				authorId: 'user-1',
				scope: POSTER_SCOPE,
				body: 'Voilà',
			})
		})

		it('writes nothing once the ceiling is reached', async () => {
			vi.mocked(accountBudget.require).mockRejectedValue(
				new AccountBudgetExceededError(LISTING_COMMENT_PER_USER.message, 900),
			)

			await expect(
				controller.reply(poster, 'public', 'lost-item-1', { body: 'Voilà' }),
			).rejects.toBeInstanceOf(AccountBudgetExceededError)
			expect(postComment.execute).not.toHaveBeenCalled()
		})
	})

	describe('comment', () => {
		it('is restricted to admins', () => {
			expect(Reflect.getMetadata('ROLES', controller.comment)).toEqual([
				'admin',
			])
		})

		it('writes on the desk side, charging no account ceiling', async () => {
			await controller.comment(admin, 'admin', 'lost-item-1', {
				body: 'Précisez la commune',
			})

			expect(postComment.execute).toHaveBeenCalledWith({
				lostItemId: 'lost-item-1',
				authorId: 'admin-1',
				scope: DESK_SCOPE,
				body: 'Précisez la commune',
			})
			expect(accountBudget.require).not.toHaveBeenCalled()
		})
	})
})
