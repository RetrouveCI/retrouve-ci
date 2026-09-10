import { Injectable } from '@nestjs/common'
import { SystemAccountService } from '@/infrastructures/auth/system-account.service'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemRepository } from '../repository/lost-item.repository'
import type {
	CreateOfficialLostItemData,
	LostItem,
} from '../types/lost-item.types'

/** What the controller hands over: the body, plus the date it parsed. */
export type CreateOfficialLostItemInput = Omit<
	CreateOfficialLostItemData,
	'userId' | 'official' | 'moderationStatus'
>

/**
 * The team's own publication. Deliberately **not** a flag on
 * `CreateLostItemUseCase`: that one writes `PENDING` and raises
 * `listing_pending`, and a boolean switching the status, the notification and
 * the matching trigger at once would hide three decisions inside one argument.
 *
 * Three things are stamped here rather than read from the body, the way
 * `CreateStickerOrderUseCase` stamps its price and its payment method:
 *
 * - the owner is the system account, never the administrator who filed it;
 * - `official` is true, which is what the public badge reads;
 * - the status is `published`, so the listing skips the moderation queue.
 *
 * No `listing_pending` is raised: the desk would be telling itself about its
 * own work. Matching is dispatched by the controller, since the listing is born
 * published and publication is the only moment it runs.
 */
@Injectable()
export class CreateOfficialLostItemUseCase implements IDomainUseCase<
	CreateOfficialLostItemInput,
	LostItem
> {
	constructor(
		private readonly repository: LostItemRepository,
		private readonly systemAccount: SystemAccountService,
	) {}

	async execute(data: CreateOfficialLostItemInput): Promise<LostItem> {
		const userId = await this.systemAccount.requireId()

		return this.repository.createOfficial({
			...data,
			userId,
			official: true,
			moderationStatus: 'published',
		})
	}
}
