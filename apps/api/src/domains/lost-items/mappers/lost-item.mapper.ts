import {
	DocumentType as PrismaDocumentType,
	LostItemCategory as PrismaLostItemCategory,
	LostItemType as PrismaLostItemType,
	ModerationReason as PrismaModerationReason,
	ModerationStatus as PrismaModerationStatus,
	ResolutionStatus as PrismaResolutionStatus,
	type LostItem as PrismaLostItem,
} from '@app/database'

import type { LostItem, PublicLostItem } from '../types/lost-item.types'
import type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
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
		documentType: lostItem.documentType
			? toDomainDocumentType(lostItem.documentType)
			: null,
		documentHolderName: lostItem.documentHolderName,
		documentNumber: lostItem.documentNumber,
		documentIssuer: lostItem.documentIssuer,
		moderationStatus: toDomainModerationStatus(lostItem.moderationStatus),
		moderationReason: lostItem.moderationReason
			? toDomainModerationReason(lostItem.moderationReason)
			: null,
		moderationReasonNote: lostItem.moderationReasonNote,
		resolutionStatus: toDomainResolutionStatus(lostItem.resolutionStatus),
		views: lostItem.views,
		contactsCount: lostItem.contactsCount,
		userId: lostItem.userId,
		createdAt: lostItem.createdAt,
		updatedAt: lostItem.updatedAt,
	}
}

/**
 * Drops the fields a public read may not carry. The holder's name stays: it is
 * what lets someone recognise their own document. The moderation reason is a
 * moderator's note to one poster — a listing hidden then republished would
 * otherwise serve it to everybody.
 */
export function toPublicLostItem(lostItem: LostItem): PublicLostItem {
	const {
		documentNumber: _number,
		moderationReason: _reason,
		moderationReasonNote: _note,
		...rest
	} = lostItem

	return rest
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

// Two tables rather than a ternary ladder: seven values, and each direction is
// checked for exhaustiveness by its `Record` key.
const REASON_TO_PRISMA: Record<ModerationReason, PrismaModerationReason> = {
	document_number_visible: PrismaModerationReason.DOCUMENT_NUMBER_VISIBLE,
	unclear_photo: PrismaModerationReason.UNCLEAR_PHOTO,
	vague_description: PrismaModerationReason.VAGUE_DESCRIPTION,
	contact_in_description: PrismaModerationReason.CONTACT_IN_DESCRIPTION,
	duplicate: PrismaModerationReason.DUPLICATE,
	off_topic: PrismaModerationReason.OFF_TOPIC,
	other: PrismaModerationReason.OTHER,
}

const REASON_TO_DOMAIN: Record<PrismaModerationReason, ModerationReason> = {
	DOCUMENT_NUMBER_VISIBLE: 'document_number_visible',
	UNCLEAR_PHOTO: 'unclear_photo',
	VAGUE_DESCRIPTION: 'vague_description',
	CONTACT_IN_DESCRIPTION: 'contact_in_description',
	DUPLICATE: 'duplicate',
	OFF_TOPIC: 'off_topic',
	OTHER: 'other',
}

export function toPrismaModerationReason(
	reason: ModerationReason,
): PrismaModerationReason {
	return REASON_TO_PRISMA[reason]
}

export function toDomainModerationReason(
	reason: PrismaModerationReason,
): ModerationReason {
	return REASON_TO_DOMAIN[reason]
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

const DOCUMENT_TYPE_TO_PRISMA: Record<DocumentType, PrismaDocumentType> = {
	national_id: PrismaDocumentType.NATIONAL_ID,
	driver_licence: PrismaDocumentType.DRIVER_LICENCE,
	bank_card: PrismaDocumentType.BANK_CARD,
	insurance_card: PrismaDocumentType.INSURANCE_CARD,
	passport: PrismaDocumentType.PASSPORT,
	student_card: PrismaDocumentType.STUDENT_CARD,
	other: PrismaDocumentType.OTHER,
}

const DOCUMENT_TYPE_TO_DOMAIN: Record<PrismaDocumentType, DocumentType> = {
	NATIONAL_ID: 'national_id',
	DRIVER_LICENCE: 'driver_licence',
	BANK_CARD: 'bank_card',
	INSURANCE_CARD: 'insurance_card',
	PASSPORT: 'passport',
	STUDENT_CARD: 'student_card',
	OTHER: 'other',
}

export function toPrismaDocumentType(
	documentType: DocumentType,
): PrismaDocumentType {
	return DOCUMENT_TYPE_TO_PRISMA[documentType]
}

export function toDomainDocumentType(
	documentType: PrismaDocumentType,
): DocumentType {
	return DOCUMENT_TYPE_TO_DOMAIN[documentType]
}
