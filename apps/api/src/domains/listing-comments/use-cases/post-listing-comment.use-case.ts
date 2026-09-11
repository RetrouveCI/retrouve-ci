import { Injectable, Logger } from '@nestjs/common'
import { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { LostItem } from '@/domains/lost-items/types/lost-item.types'
import { notifyDesk, notifyUser } from '@/domains/notifications/helpers/notify'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { commentExcerpt } from '../helpers/comment-excerpt'
import { requireThreadListing } from '../helpers/require-thread-listing'
import { toListingCommentView } from '../mappers/listing-comment.mapper'
import { ListingCommentRepository } from '../repository/listing-comment.repository'
import type {
	ListingCommentView,
	ThreadScope,
} from '../types/listing-comment.types'

interface PostListingCommentInput {
	lostItemId: string
	authorId: string
	scope: ThreadScope
	body: string
}

/** The side written is the scope's, so it is always the app that asked. */
@Injectable()
export class PostListingCommentUseCase implements IDomainUseCase<
	PostListingCommentInput,
	ListingCommentView
> {
	private readonly logger = new Logger(PostListingCommentUseCase.name)

	constructor(
		private readonly repository: ListingCommentRepository,
		private readonly lostItems: LostItemRepository,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute({
		lostItemId,
		authorId,
		scope,
		body,
	}: PostListingCommentInput): Promise<ListingCommentView> {
		const lostItem = await requireThreadListing(
			this.lostItems,
			lostItemId,
			scope,
		)
		const comment = await this.repository.create({
			lostItemId,
			authorId,
			authorSide: scope.side,
			body,
		})

		await this.tellTheOtherSide(scope, lostItem, body)

		return toListingCommentView(comment)
	}

	private tellTheOtherSide(
		scope: ThreadScope,
		lostItem: LostItem,
		body: string,
	): Promise<void> {
		const message = `« ${lostItem.title} » : ${commentExcerpt(body)}`

		return scope.side === 'admin'
			? notifyUser(this.createNotification, this.logger, {
					type: 'listing_commented',
					title: "L'équipe a commenté votre annonce",
					message,
					link: `/account/posts/${lostItem.id}`,
					userId: lostItem.userId,
				})
			: notifyDesk(this.createNotification, this.logger, {
					type: 'listing_replied',
					title: 'Un posteur a répondu',
					message,
					link: '/posts',
				})
	}
}
