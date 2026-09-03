import { formatRelativeDate } from '@/shared/utils/date'
import type {
	LostItem,
	LostItemDocument,
	UserLostItem,
} from '@/shared/types/lost-item'
import type { LostItemApiDto, LostItemDetail } from '../types/lost-items.types'

/** Nothing is carried unless the listing named the piece it describes. */
function toDocument(dto: LostItemApiDto): LostItemDocument | undefined {
	if (!dto.documentType) return undefined

	return {
		type: dto.documentType,
		holderName: dto.documentHolderName ?? undefined,
		issuer: dto.documentIssuer ?? undefined,
	}
}

export function toLostItem(dto: LostItemApiDto): LostItem {
	return {
		id: dto.id,
		title: dto.title,
		description: dto.description,
		location: dto.commune ? `${dto.commune}, ${dto.ville}` : dto.ville,
		ville: dto.ville,
		commune: dto.commune ?? undefined,
		date: formatRelativeDate(dto.eventDate),
		dateISO: dto.eventDate.slice(0, 10),
		type: dto.type,
		category: dto.category,
		image: dto.photos[0],
		images: dto.photos,
		document: toDocument(dto),
	}
}

export function toLostItemDetail(dto: LostItemApiDto): LostItemDetail {
	return {
		...toLostItem(dto),
		contact: { name: dto.contactName, whatsapp: dto.contactWhatsapp },
	}
}

export function toUserLostItem(dto: LostItemApiDto): UserLostItem {
	return {
		...toLostItem(dto),
		status: dto.resolutionStatus,
		moderationStatus: dto.moderationStatus,
		createdAt: dto.createdAt,
		views: dto.views,
		contacts: dto.contactsCount,
	}
}
