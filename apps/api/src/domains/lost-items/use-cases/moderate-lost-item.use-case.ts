import { Injectable, Logger } from '@nestjs/common'
import { moderationReasonSentence } from '@app/contracts/lost-items'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { notifyUser } from '@/domains/notifications/helpers/notify'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireLostItem } from '../helpers/require-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type {
	LostItem,
	ModerationDecision,
	ModerationOutcome,
} from '../types/lost-item.types'

type ModerateLostItemInput = ModerationDecision & { id: string }

@Injectable()
export class ModerateLostItemUseCase implements IDomainUseCase<
	ModerateLostItemInput,
	ModerationOutcome
> {
	private readonly logger = new Logger(ModerateLostItemUseCase.name)

	constructor(
		private readonly repository: LostItemRepository,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute({
		id,
		...decision
	}: ModerateLostItemInput): Promise<ModerationOutcome> {
		const before = await requireLostItem(this.repository, id)
		const lostItem = await this.repository.updateModerationStatus(id, decision)

		// A decision that changes nothing tells nobody: a moderator who publishes
		// twice must not notify twice, nor look for matches twice.
		if (decided(before, lostItem)) {
			await notifyUser(this.createNotification, this.logger, {
				type: 'listing_moderated',
				...verdict(lostItem),
				link: '/account/posts',
				userId: lostItem.userId,
			})
		}

		return {
			lostItem,
			becamePublished:
				before.moderationStatus !== 'published' &&
				lostItem.moderationStatus === 'published',
		}
	}
}

function decided(before: LostItem, after: LostItem): boolean {
	return (
		before.moderationStatus !== after.moderationStatus ||
		before.moderationReason !== after.moderationReason ||
		before.moderationReasonNote !== after.moderationReasonNote
	)
}

// ⚠️ Nothing here promises a return online: `repository.update()` writes no
// moderation status, so an edit does not send a hidden listing back for review.
const VERDICTS: Record<
	LostItem['moderationStatus'],
	(title: string) => { title: string; message: string }
> = {
	published: title => ({
		title: 'Votre annonce est en ligne',
		message: `« ${title} » a été validée : elle est maintenant visible publiquement.`,
	}),
	hidden: title => ({
		title: 'Votre annonce a été masquée',
		message: `« ${title} » n'est plus visible publiquement.`,
	}),
	pending: title => ({
		title: 'Votre annonce est en attente',
		message: `« ${title} » repasse en attente de validation et n'est plus visible publiquement.`,
	}),
}

function verdict(lostItem: LostItem): { title: string; message: string } {
	const notice = VERDICTS[lostItem.moderationStatus](lostItem.title)

	if (!lostItem.moderationReason) return notice

	// The same code the card words, so a fault reads the same way on both.
	const sentence = moderationReasonSentence({
		reason: lostItem.moderationReason,
		note: lostItem.moderationReasonNote,
	})

	return sentence
		? { ...notice, message: `${notice.message} Motif : ${sentence}` }
		: notice
}
