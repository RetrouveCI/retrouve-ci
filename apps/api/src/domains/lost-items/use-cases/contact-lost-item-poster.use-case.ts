import { Injectable } from '@nestjs/common'
import { toWhatsAppUrl } from '@app/contracts/shared'
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
	constructor(private readonly repository: LostItemRepository) {}

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

		return { url }
	}
}

// A lost item is contacted by whoever found it, a found one by whoever lost it.
function contactMessage(title: string, type: LostItemType): string {
	return type === 'lost'
		? `Bonjour, j'ai peut-être trouvé votre objet : « ${title} ». Je vous écris depuis RetrouveCI.`
		: `Bonjour, l'objet que vous avez trouvé est peut-être le mien : « ${title} ». Je vous écris depuis RetrouveCI.`
}
