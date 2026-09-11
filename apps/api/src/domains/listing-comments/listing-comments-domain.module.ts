import { Module } from '@nestjs/common'
import { LostItemsDomainModule } from '@/domains/lost-items/lost-items-domain.module'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { ListingCommentRepository } from './repository/listing-comment.repository'
import { GetListingThreadUseCase } from './use-cases/get-listing-thread.use-case'
import { GetUnreadListingThreadsUseCase } from './use-cases/get-unread-listing-threads.use-case'
import { MarkListingThreadReadUseCase } from './use-cases/mark-listing-thread-read.use-case'
import { PostListingCommentUseCase } from './use-cases/post-listing-comment.use-case'

const providers = [
	ListingCommentRepository,
	GetListingThreadUseCase,
	GetUnreadListingThreadsUseCase,
	MarkListingThreadReadUseCase,
	PostListingCommentUseCase,
]

/** `lost-items` owns the listing a thread hangs on; `notifications` tells the other side. */
@Module({
	imports: [LostItemsDomainModule, NotificationsDomainModule],
	providers,
	exports: providers,
})
export class ListingCommentsDomainModule {}
