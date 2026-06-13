import {
	LostItemCategory as PrismaLostItemCategory,
	LostItemType as PrismaLostItemType,
	ModerationStatus as PrismaModerationStatus,
	ResolutionStatus as PrismaResolutionStatus,
	type LostItem as PrismaLostItem,
} from '@retrouve-ci/database'

import type { LostItem } from '../models/lost-item.model'
import type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
} from '../types/lost-item.types'

export function toDomainLostItem(lostItem: PrismaLostItem): LostItem {
	return {
		id: lostItem.id,
		type: toDomainType(lostItem.type),
		category: toDomainCategory(lostItem.category),
		title: lostItem.title,
		description: lostItem.description,
		ville: lostItem.ville,
		commune: lostItem.commune,
		eventDate: lostItem.eventDate,
		contactName: lostItem.contactName,
		contactWhatsapp: lostItem.contactWhatsapp,
		photos: lostItem.photos,
		moderationStatus: toDomainModerationStatus(lostItem.moderationStatus),
		resolutionStatus: toDomainResolutionStatus(lostItem.resolutionStatus),
		views: lostItem.views,
		contactsCount: lostItem.contactsCount,
		userId: lostItem.userId,
		createdAt: lostItem.createdAt,
		updatedAt: lostItem.updatedAt,
	}
}

export function toPrismaType(type: LostItemType): PrismaLostItemType {
	return type === 'lost' ? PrismaLostItemType.LOST : PrismaLostItemType.FOUND
}

export function toDomainType(type: PrismaLostItemType): LostItemType {
	return type === PrismaLostItemType.LOST ? 'lost' : 'found'
}

const CATEGORY_TO_PRISMA: Record<LostItemCategory, PrismaLostItemCategory> = {
	phone: PrismaLostItemCategory.PHONE,
	keys: PrismaLostItemCategory.KEYS,
	wallet: PrismaLostItemCategory.WALLET,
	bag: PrismaLostItemCategory.BAG,
	electronics: PrismaLostItemCategory.ELECTRONICS,
	clothing: PrismaLostItemCategory.CLOTHING,
	jewelry: PrismaLostItemCategory.JEWELRY,
	documents: PrismaLostItemCategory.DOCUMENTS,
	other: PrismaLostItemCategory.OTHER,
}

const CATEGORY_TO_DOMAIN: Record<PrismaLostItemCategory, LostItemCategory> = {
	PHONE: 'phone',
	KEYS: 'keys',
	WALLET: 'wallet',
	BAG: 'bag',
	ELECTRONICS: 'electronics',
	CLOTHING: 'clothing',
	JEWELRY: 'jewelry',
	DOCUMENTS: 'documents',
	OTHER: 'other',
}

export function toPrismaCategory(
	category: LostItemCategory,
): PrismaLostItemCategory {
	return CATEGORY_TO_PRISMA[category]
}

export function toDomainCategory(
	category: PrismaLostItemCategory,
): LostItemCategory {
	return CATEGORY_TO_DOMAIN[category]
}

export function toPrismaModerationStatus(
	status: ModerationStatus,
): PrismaModerationStatus {
	return status === 'pending'
		? PrismaModerationStatus.PENDING
		: status === 'published'
			? PrismaModerationStatus.PUBLISHED
			: PrismaModerationStatus.HIDDEN
}

export function toDomainModerationStatus(
	status: PrismaModerationStatus,
): ModerationStatus {
	return status === PrismaModerationStatus.PENDING
		? 'pending'
		: status === PrismaModerationStatus.PUBLISHED
			? 'published'
			: 'hidden'
}

export function toPrismaResolutionStatus(
	status: ResolutionStatus,
): PrismaResolutionStatus {
	return status === 'active'
		? PrismaResolutionStatus.ACTIVE
		: status === 'resolved'
			? PrismaResolutionStatus.RESOLVED
			: PrismaResolutionStatus.EXPIRED
}

export function toDomainResolutionStatus(
	status: PrismaResolutionStatus,
): ResolutionStatus {
	return status === PrismaResolutionStatus.ACTIVE
		? 'active'
		: status === PrismaResolutionStatus.RESOLVED
			? 'resolved'
			: 'expired'
}
