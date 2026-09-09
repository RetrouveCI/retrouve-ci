import { Injectable, Logger } from '@nestjs/common'
import { toWhatsAppUrl } from '@app/contracts/shared'
import { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { notifyUser } from '@/domains/notifications/helpers/notify'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { LostItemUnreachableError } from '../errors/lost-item.errors'
import { requirePublishedLostItem } from '../helpers/require-published-lost-item'
import { LostItemRepository } from '../repository/lost-item.repository'
import type { LostItemType } from '../types/lost-item.types'

interface ContactTarget {
	url: string
}

/**
 * Records the contact **and** answers where the finder is sent, so no page
 * carries the poster's line — the shape A8 gave a sticker. No front ever called
 * this route, which is why `contactsCount` read zero on four screens.
 */
@Injectable()
export class ContactLostItemPosterUseCase implements IDomainUseCase<
	string,
	ContactTarget
> {
	private readonly logger = new Logger(ContactLostItemPosterUseCase.name)

	constructor(
		private readonly repository: LostItemRepository,
		private readonly createNotification: CreateNotificationUseCase,
	) {}

	async execute(id: string): Promise<ContactTarget> {
		const lostItem = await requirePublishedLostItem(this.repository, id)
		const url = toWhatsAppUrl(
			lostItem.contactWhatsapp,
			contactMessage(lostItem.title, lostItem.type),
		)

		if (!url) {
			throw new LostItemUnreachableError()
		}

		await this.repository.incrementContacts(id)

		// The count says how many; this says who was sent and when — the trace
		// `contactsCount` cannot carry.
		await notifyUser(this.createNotification, this.logger, {
			type: 'listing_contacted',
			title: "Quelqu'un vous a contacté",
			message: contactNotice(lostItem.title, lostItem.type),
			link: '/account/posts',
			userId: lostItem.userId,
		})

		return { url }
	}
}

// A lost item is contacted by whoever found it, a found one by whoever lost it.
function contactMessage(title: string, type: LostItemType): string {
	return type === 'lost'
		? `Bonjour, j'ai peut-être trouvé votre objet : « ${title} ». Je vous écris depuis RetrouveCI.`
		: `Bonjour, l'objet que vous avez trouvé est peut-être le mien : « ${title} ». Je vous écris depuis RetrouveCI.`
}

// Read from the poster's side, where the message above is read from the other.
function contactNotice(title: string, type: LostItemType): string {
	return type === 'lost'
		? `Une personne pense avoir trouvé « ${title} » et vous écrit sur WhatsApp.`
		: `Une personne pense que « ${title} » lui appartient et vous écrit sur WhatsApp.`
}
