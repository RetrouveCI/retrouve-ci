import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requirePublishedLostItem } from '../helpers/require-published-lost-item'
import { toPublicLostItem } from '../mappers/lost-item.mapper'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { PublicLostItem } from '../types/lost-item.types'

@Injectable()
export class RecordLostItemContactUseCase implements IDomainUseCase<
	string,
	PublicLostItem
> {
	constructor(private readonly repository: LostItemRepository) {}

	/** Anonymous by design — whoever found the object is not signed in. */
	async execute(id: string): Promise<PublicLostItem> {
		const lostItem = await requirePublishedLostItem(this.repository, id)

		await this.repository.incrementContacts(id)

		return toPublicLostItem({
			...lostItem,
			contactsCount: lostItem.contactsCount + 1,
		})
	}
}
