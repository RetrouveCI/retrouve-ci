import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { CreateLostItemData, LostItem } from '../types/lost-item.types'

@Injectable()
export class CreateLostItemUseCase implements IDomainUseCase<
	CreateLostItemData,
	LostItem
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute(data: CreateLostItemData): Promise<LostItem> {
		return this.repository.create(data)
	}
}
