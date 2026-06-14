import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LostItem } from '@/shared/types/lost-item'
import type { LostItemApiDto, LostItemDetail } from '../lost-items.types'

function formatRelativeDate(isoDate: string): string {
	const relative = formatDistanceToNow(new Date(isoDate), {
		addSuffix: true,
		locale: fr,
	})

	return relative.charAt(0).toUpperCase() + relative.slice(1)
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
	}
}

export function toLostItemDetail(dto: LostItemApiDto): LostItemDetail {
	return {
		...toLostItem(dto),
		contact: { name: dto.contactName, method: dto.contactWhatsapp },
	}
}
