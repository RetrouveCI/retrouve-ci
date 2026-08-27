import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireOwnedLostItem } from '../helpers/require-owned-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'

interface DeleteLostItemInput {
	id: string
	userId: string
}

@Injectable()
export class DeleteLostItemUseCase implements IDomainUseCase<
	DeleteLostItemInput,
	void
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute({ id, userId }: DeleteLostItemInput): Promise<void> {
		await requireOwnedLostItem(this.repository, id, userId)

		await this.repository.delete(id)
	}
}
