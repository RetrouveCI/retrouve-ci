import { Injectable, Logger } from '@nestjs/common'
import { requireLostItem } from '@/domains/lost-items/helpers/require-lost-item'
import { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { computeMatches } from '../helpers/compute-matches'

@Injectable()
export class NotifyMatchesUseCase implements IDomainUseCase<string, void> {
	private readonly logger = new Logger(NotifyMatchesUseCase.name)

	constructor(
		private readonly lostItemRepository: LostItemRepository,
		private readonly createNotificationUseCase: CreateNotificationUseCase,
	) {}

	async execute(id: string): Promise<void> {
		const source = await requireLostItem(this.lostItemRepository, id)

		/** Unlike `FindMatchesUseCase`, an unpublished source is not an error: the
		 * job runs at publication time, and moderation may not have passed yet. */
		if (source.moderationStatus !== 'published') {
			return
		}

		const matches = await computeMatches(this.lostItemRepository, source)
		const relevantMatches = matches.filter(
			match => match.lostItem.userId !== source.userId,
		)

		await Promise.all(
			relevantMatches.map(match =>
				this.createNotificationUseCase.execute({
					type: 'match_found',
					title: 'Correspondance trouvée',
					message: `Une annonce correspondant à "${source.title}" a été trouvée.`,
					link: `/posts/${match.lostItem.id}`,
					userId: source.userId,
				}),
			),
		)

		this.logger.log(
			`${relevantMatches.length} match(es) notified for lost item ${id}`,
		)
	}
}
