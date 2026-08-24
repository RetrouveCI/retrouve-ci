import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemNotFoundError } from '../errors/lost-item.errors'
import { requireLostItem } from '../helpers/require-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'

interface ViewLostItemInput {
	id: string
	/** Absent for an anonymous visitor: the route is optionally authenticated. */
	viewerId?: string
}

@Injectable()
export class ViewLostItemUseCase
	implements IDomainUseCase<ViewLostItemInput, LostItem>
{
	constructor(private readonly repository: LostItemRepository) {}

	async execute({ id, viewerId }: ViewLostItemInput): Promise<LostItem> {
		const lostItem = await requireLostItem(this.repository, id)
		const isOwner = viewerId !== undefined && lostItem.userId === viewerId

		/**
		 * An unpublished listing answers **not found** to everyone but its author,
		 * who needs to preview what is still under moderation. Not forbidden:
		 * confirming that an id exists would leak more than it helps.
		 */
		if (lostItem.moderationStatus !== 'published' && !isOwner) {
			throw new LostItemNotFoundError(id)
		}

		/** An author re-reading their own listing is not an audience figure. */
		if (isOwner) {
			return lostItem
		}

		await this.repository.incrementViews(id)

		return { ...lostItem, views: lostItem.views + 1 }
	}
}
