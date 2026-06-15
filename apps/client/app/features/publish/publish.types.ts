import type { LostItemType, LostItemCategory } from '@/shared/types/lost-item'

export interface CreateLostItemPayload {
	type: LostItemType
	category: LostItemCategory
	title: string
	description: string
	ville: string
	commune?: string
	eventDate: string
	contactName: string
	contactWhatsapp: string
}
