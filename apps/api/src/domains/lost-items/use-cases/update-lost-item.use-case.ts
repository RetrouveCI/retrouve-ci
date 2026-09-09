import { Injectable } from '@nestjs/common'
import { refusesPhotos } from '@app/contracts/lost-items'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemPhotosRefusedError } from '../errors/lost-item.errors'
import { requireOwnedLostItem } from '../helpers/require-owned-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type {
	LostItem,
	ResolvedAtWrite,
	UpdateLostItemData,
} from '../types/lost-item.types'

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
		const stored = await requireOwnedLostItem(this.repository, id, userId)

		// The category is not patchable, so the stored one is the only witness.
		if (refusesPhotos(stored.category) && data.photos?.length) {
			throw new LostItemPhotosRefusedError()
		}

		return this.repository.update(id, data, resolvedAtFor(stored, data))
	}
}

// On the transition alone, from the row already fetched: re-saving a resolved
// listing must not push the day it was handed back into the current month, and
// reopening one must not leave a date behind.
function resolvedAtFor(
	stored: LostItem,
	data: UpdateLostItemData,
): ResolvedAtWrite {
	const next = data.resolutionStatus
	if (next === undefined || next === stored.resolutionStatus) return undefined

	return next === 'resolved' ? new Date() : null
}
