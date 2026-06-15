import { formatRelativeDate } from '@/shared/lib/format-relative-date'
import type { LostItem, UserLostItem } from '@/shared/types/lost-item'
import type { LostItemApiDto, LostItemDetail } from '../lost-items.types'

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
	}
}

export function toLostItemDetail(dto: LostItemApiDto): LostItemDetail {
	return {
		...toLostItem(dto),
		contact: { name: dto.contactName, method: dto.contactWhatsapp },
	}
}

export function toUserLostItem(dto: LostItemApiDto): UserLostItem {
	return {
		...toLostItem(dto),
		status: dto.resolutionStatus,
		createdAt: dto.createdAt,
		views: dto.views,
		contacts: dto.contactsCount,
	}
}
