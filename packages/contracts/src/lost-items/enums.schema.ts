import { z } from 'zod'
import {
	DOCUMENT_TYPES,
	LOST_ITEM_CATEGORIES,
	LOST_ITEM_TYPES,
	MODERATION_STATUSES,
	RESOLUTION_STATUSES,
} from './lost-items.const'

export const lostItemTypeSchema = z.enum(LOST_ITEM_TYPES, {
	error: "Type d'annonce invalide",
})

export const lostItemCategorySchema = z.enum(LOST_ITEM_CATEGORIES, {
	error: 'Catégorie invalide',
})

/**
 * Named, because a front that offers « nothing chosen » alongside the enum has
 * to wrap it in a union — and a bare union reports `Invalid input` in English.
 */
export const DOCUMENT_TYPE_ERROR = 'Type de pièce invalide'

export const documentTypeSchema = z.enum(DOCUMENT_TYPES, {
	error: DOCUMENT_TYPE_ERROR,
})

export const resolutionStatusSchema = z.enum(RESOLUTION_STATUSES, {
	error: 'Statut invalide',
})

export const moderationStatusSchema = z.enum(MODERATION_STATUSES, {
	error: 'Statut de modération invalide',
})

export type LostItemType = z.output<typeof lostItemTypeSchema>
export type LostItemCategory = z.output<typeof lostItemCategorySchema>
export type DocumentType = z.output<typeof documentTypeSchema>
export type ResolutionStatus = z.output<typeof resolutionStatusSchema>
export type ModerationStatus = z.output<typeof moderationStatusSchema>
