import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireLostItem } from '../helpers/require-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem } from '../types/lost-item.types'

@Injectable()
export class GetLostItemByIdUseCase
	implements IDomainUseCase<string, LostItem>
{
	constructor(private readonly repository: LostItemRepository) {}

	async execute(id: string): Promise<LostItem> {
		return requireLostItem(this.repository, id)
	}
}
