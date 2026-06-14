export type LostItemType = 'lost' | 'found'
export type LostItemStatus = 'active' | 'resolved' | 'expired'
export type LostItemCategory =
	| 'phones'
	| 'keys'
	| 'wallets'
	| 'bags'
	| 'electronics'
	| 'other'

export interface LostItem {
	id: string
	title: string
	description: string
	location: string
	ville?: string
	commune?: string
	date: string
	dateISO?: string
	type: LostItemType
	category: LostItemCategory | string
	image?: string
}

export interface UserLostItem extends LostItem {
	status: LostItemStatus
	createdAt: string
	views: number
	contacts: number
}
