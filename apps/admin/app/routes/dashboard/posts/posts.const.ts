import { MODERATION_REASONS } from '@app/contracts/lost-items'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import type {
	DocumentType,
	LostItemCategory,
	ModerationReason,
	ModerationStatus,
} from './types/posts.types'

// The contract owns the categories and the statuses; the backoffice owns what
// they are called and how they are toned. Keying both by the contract's type is
// what turns a missing label into a type error.
export const CATEGORY_LABELS: Record<LostItemCategory, string> = {
	phone: 'Téléphone',
	keys: 'Clés',
	wallet: 'Portefeuille',
	bag: 'Sac',
	electronics: 'Électronique',
	clothing: 'Vêtement',
	jewelry: 'Bijou',
	documents: 'Documents',
	other: 'Autre',
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
	national_id: "Carte nationale d'identité",
	driver_licence: 'Permis de conduire',
	bank_card: 'Carte bancaire',
	insurance_card: "Carte d'assurance",
	passport: 'Passeport',
	student_card: 'Carte étudiante',
	other: 'Autre pièce',
}

/** Short, because they fill a dropdown; the client words the poster's version. */
export const MODERATION_REASON_LABELS: Record<ModerationReason, string> = {
	document_number_visible: 'Numéro de pièce lisible sur la photo',
	unclear_photo: 'Photo inexploitable',
	vague_description: 'Description trop vague',
	contact_in_description: 'Coordonnées dans la description',
	duplicate: 'Doublon',
	off_topic: 'Hors sujet',
	other: 'Autre — je précise',
}

export const MODERATION_REASON_OPTIONS = MODERATION_REASONS.map(value => ({
	value,
	label: MODERATION_REASON_LABELS[value],
}))

export const MODERATION_CONFIG: Record<
	ModerationStatus,
	{ label: string; className: string }
> = {
	pending: { label: 'En attente', className: STATUS_TONE_CLASSES.warning },
	published: { label: 'Publié', className: STATUS_TONE_CLASSES.success },
	hidden: { label: 'Masqué', className: STATUS_TONE_CLASSES.neutral },
}
