import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireLostItem } from '../helpers/require-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItem, ModerationStatus } from '../types/lost-item.types'

interface ModerateLostItemInput {
	id: string
	moderationStatus: ModerationStatus
}

@Injectable()
export class ModerateLostItemUseCase implements IDomainUseCase<
	ModerateLostItemInput,
	LostItem
> {
	constructor(private readonly repository: LostItemRepository) {}

	async execute({
		id,
		moderationStatus,
	}: ModerateLostItemInput): Promise<LostItem> {
		await requireLostItem(this.repository, id)

		return this.repository.updateModerationStatus(id, moderationStatus)
	}
}
