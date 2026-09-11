import { Module } from '@nestjs/common'
import { ListingCommentsDomainModule } from '@/domains/listing-comments/listing-comments-domain.module'
import { RateLimitModule } from '@/shared/rate-limit/rate-limit.module'
import { ListingCommentsController } from './listing-comments.controller'

@Module({
	imports: [ListingCommentsDomainModule, RateLimitModule],
	controllers: [ListingCommentsController],
})
export class ListingCommentsModule {}
