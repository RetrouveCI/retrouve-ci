import { formatRelativeDate } from '@/shared/utils/date'
import type {
	ListingModeration,
	LostItem,
	LostItemDocument,
	UserLostItem,
} from '@/shared/types/lost-item'
import type {
	LostItemApiDto,
	LostItemDetail,
	MyLostItemApiDto,
} from '../types/lost-items.types'

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

/** Nothing is carried unless a moderator named a reason. */
function toModeration(dto: MyLostItemApiDto): ListingModeration | undefined {
	if (!dto.moderationReason) return undefined

	return {
		reason: dto.moderationReason,
		note: dto.moderationReasonNote ?? undefined,
	}
}

export function toUserLostItem(dto: MyLostItemApiDto): UserLostItem {
	return {
		...toLostItem(dto),
		status: dto.resolutionStatus,
		moderationStatus: dto.moderationStatus,
		moderation: toModeration(dto),
		createdAt: dto.createdAt,
		views: dto.views,
		contacts: dto.contactsCount,
	}
}
