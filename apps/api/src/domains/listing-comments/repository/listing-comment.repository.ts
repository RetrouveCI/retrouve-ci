import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infrastructures/database/prisma.service'
import { THREAD_LIMIT, UNREAD_THREADS_LIMIT } from '../listing-comments.const'
import {
	toDomainListingComment,
	toPrismaSide,
} from '../mappers/listing-comment.mapper'
import type {
	CreateListingCommentData,
	ListingComment,
	ThreadScope,
	UnreadThread,
} from '../types/listing-comment.types'

// The only place a thread's `where` clause is built, so no query can reach a
// listing the poster does not own by forgetting to name them.
export function whereFor(scope: ThreadScope) {
	return scope.side === 'admin' ? {} : { lostItem: { userId: scope.userId } }
}

// What a side has yet to read is what the other side wrote.
export function unreadFor(scope: ThreadScope) {
	return {
		...whereFor(scope),
		authorSide: toPrismaSide(scope.side === 'admin' ? 'owner' : 'admin'),
		readAt: null,
	}
}

@Injectable()
export class ListingCommentRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create(data: CreateListingCommentData): Promise<ListingComment> {
		const comment = await this.prisma.listingComment.create({
			data: {
				lostItemId: data.lostItemId,
				authorId: data.authorId,
				authorSide: toPrismaSide(data.authorSide),
				body: data.body,
			},
		})

		return toDomainListingComment(comment)
	}

	/** The latest `THREAD_LIMIT`, in reading order. */
	async listThread(
		lostItemId: string,
		scope: ThreadScope,
	): Promise<ListingComment[]> {
		const comments = await this.prisma.listingComment.findMany({
			where: { lostItemId, ...whereFor(scope) },
			orderBy: { createdAt: 'desc' },
			take: THREAD_LIMIT,
		})

		return comments.reverse().map(toDomainListingComment)
	}

	async markThreadRead(lostItemId: string, scope: ThreadScope): Promise<void> {
		await this.prisma.listingComment.updateMany({
			where: { lostItemId, ...unreadFor(scope) },
			data: { readAt: new Date() },
		})
	}

	async listUnreadThreads(scope: ThreadScope): Promise<UnreadThread[]> {
		const groups = await this.prisma.listingComment.groupBy({
			by: ['lostItemId'],
			where: unreadFor(scope),
			_count: { _all: true },
			orderBy: { _max: { createdAt: 'desc' } },
			take: UNREAD_THREADS_LIMIT,
		})

		return groups.map(group => ({
			lostItemId: group.lostItemId,
			unread: group._count._all,
		}))
	}
}
