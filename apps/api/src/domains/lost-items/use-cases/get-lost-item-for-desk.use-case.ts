import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireLostItem } from '../helpers/require-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'

/**
 * The desk reads any listing, published or not. `ViewLostItemUseCase` answers
 * an unpublished one to its author alone, administrators included — which is
 * precisely the listing the backoffice has to open to moderate it.
 *
 * It counts no view either: a moderator reading a listing is not an audience
 * figure, the same reason its author's own read does not count.
 */
@Injectable()
export class GetLostItemForDeskUseCase implements IDomainUseCase<
	string,
	LostItem
> {
	constructor(private readonly repository: LostItemRepository) {}

	execute(id: string): Promise<LostItem> {
		return requireLostItem(this.repository, id)
	}
}
