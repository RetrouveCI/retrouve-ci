import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requirePublishedLostItem } from '../helpers/require-published-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'

@Injectable()
export class RecordLostItemContactUseCase implements IDomainUseCase<
	string,
	LostItem
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute(id: string): Promise<LostItem> {
		const lostItem = await requirePublishedLostItem(this.repository, id)

		await this.repository.incrementContacts(id)

		return { ...lostItem, contactsCount: lostItem.contactsCount + 1 }
	}
}
