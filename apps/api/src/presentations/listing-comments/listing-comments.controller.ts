import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	createListingCommentSchema,
	type CreateListingCommentData,
} from '@app/contracts/listing-comments'
import { Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { threadScope } from '@/domains/listing-comments/helpers/thread-scope'
import { GetListingThreadUseCase } from '@/domains/listing-comments/use-cases/get-listing-thread.use-case'
import { GetUnreadListingThreadsUseCase } from '@/domains/listing-comments/use-cases/get-unread-listing-threads.use-case'
import { MarkListingThreadReadUseCase } from '@/domains/listing-comments/use-cases/mark-listing-thread-read.use-case'
import { PostListingCommentUseCase } from '@/domains/listing-comments/use-cases/post-listing-comment.use-case'
import { Audience } from '@/shared/auth/decorators/audience.decorator'
import type { SessionAudience } from '@/shared/auth/session-audience'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { AccountBudget } from '@/shared/rate-limit/account-budget.service'
import { LISTING_COMMENT_PER_USER } from '@/shared/rate-limit/rate-limit.policy'
import { ApiZodBody } from '@/shared/swagger/api-zod.decorator'

@ApiTags('listing-comments')
@ApiBearerAuth()
@Controller('lost-items')
export class ListingCommentsController {
	constructor(
		private readonly getListingThread: GetListingThreadUseCase,
		private readonly getUnreadListingThreads: GetUnreadListingThreadsUseCase,
		private readonly postListingComment: PostListingCommentUseCase,
		private readonly markListingThreadRead: MarkListingThreadReadUseCase,
		private readonly accountBudget: AccountBudget,
	) {}

	@Get('comments/unread')
	listUnread(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
	) {
		return this.getUnreadListingThreads.execute(
			threadScope(audience, session.user),
		)
	}

	@Get(':id/comments')
	getThread(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
		@Param('id') id: string,
	) {
		return this.getListingThread.execute({
			lostItemId: id,
			scope: threadScope(audience, session.user),
		})
	}

	// The two writes differ in what bounds them, not in what they write: the side
	// is the audience's on both. A path each, since `limitFor` reads paths and
	// not methods. The poster's ceiling is its own — a reply is not a listing.
	@Post(':id/comments')
	@ApiZodBody(createListingCommentSchema)
	async reply(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(createListingCommentSchema))
		{ body }: CreateListingCommentData,
	) {
		await this.accountBudget.require(LISTING_COMMENT_PER_USER, session.user.id)

		return this.postListingComment.execute({
			lostItemId: id,
			authorId: session.user.id,
			scope: threadScope(audience, session.user),
			body,
		})
	}

	@Post(':id/comments/desk')
	@Roles(['admin'])
	@ApiZodBody(createListingCommentSchema)
	comment(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(createListingCommentSchema))
		{ body }: CreateListingCommentData,
	) {
		return this.postListingComment.execute({
			lostItemId: id,
			authorId: session.user.id,
			scope: threadScope(audience, session.user),
			body,
		})
	}

	@Patch(':id/comments/read')
	@HttpCode(HttpStatus.NO_CONTENT)
	async markRead(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
		@Param('id') id: string,
	): Promise<void> {
		await this.markListingThreadRead.execute({
			lostItemId: id,
			scope: threadScope(audience, session.user),
		})
	}
}
