import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'
import type { LostItemCategory, ModerationStatus } from './types/posts.types'

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

export const MODERATION_CONFIG: Record<
	ModerationStatus,
	{ label: string; className: string }
> = {
	pending: { label: 'En attente', className: STATUS_TONE_CLASSES.warning },
	published: { label: 'Publié', className: STATUS_TONE_CLASSES.success },
	hidden: { label: 'Masqué', className: STATUS_TONE_CLASSES.neutral },
}
