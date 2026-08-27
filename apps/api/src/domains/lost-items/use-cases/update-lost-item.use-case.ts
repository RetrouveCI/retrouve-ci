import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireOwnedLostItem } from '../helpers/require-owned-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem, UpdateLostItemData } from '../types/lost-item.types'

interface UpdateLostItemInput {
	id: string
	userId: string
	data: UpdateLostItemData
}

@Injectable()
export class UpdateLostItemUseCase implements IDomainUseCase<
	UpdateLostItemInput,
	LostItem
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute({ id, userId, data }: UpdateLostItemInput): Promise<LostItem> {
		await requireOwnedLostItem(this.repository, id, userId)

		return this.repository.update(id, data)
	}
}
