import {
	Clock,
	Package,
	PackageCheck,
	Truck,
	XCircle,
	type LucideIcon,
} from 'lucide-react'
import type {
	StickerOrderSource,
	StickerOrderStatus,
} from '@app/contracts/sticker-orders'
import { STATUS_TONE_CLASSES } from '@/shared/constants/status-tone'

// An operator's vocabulary, so not in the contract — the split the moderation
// reasons use. A source added there is a type error here.
export const ORDER_SOURCE_LABELS: Record<StickerOrderSource, string> = {
	home: "Bloc de l'accueil",
	stickers_page: 'Page Stickers',
	account: 'Compte client',
	direct: 'Accès direct',
}

export const ORDER_STATUS_CONFIG: Record<
	StickerOrderStatus,
	{ label: string; className: string; icon: LucideIcon }
> = {
	pending: {
		label: 'En attente',
		className: STATUS_TONE_CLASSES.warning,
		icon: Clock,
	},
	processing: {
		label: 'En traitement',
		className: STATUS_TONE_CLASSES.info,
		icon: Package,
	},
	shipped: {
		label: 'Expédiée',
		className: STATUS_TONE_CLASSES.purple,
		icon: Truck,
	},
	delivered: {
		label: 'Livrée',
		className: STATUS_TONE_CLASSES.success,
		icon: PackageCheck,
	},
	cancelled: {
		label: 'Annulée',
		className: STATUS_TONE_CLASSES.danger,
		icon: XCircle,
	},
}

/** The one step the backoffice offers next; the list and the page read it. */
export const NEXT_ORDER_STATUS: Record<
	StickerOrderStatus,
	{ status: StickerOrderStatus; label: string } | null
> = {
	pending: { status: 'processing', label: 'Marquer en traitement' },
	processing: { status: 'shipped', label: 'Marquer comme expédiée' },
	shipped: { status: 'delivered', label: 'Marquer comme livrée' },
	delivered: null,
	cancelled: null,
}

/** Once it has left, a pack is on the courier's arm: it is delivered, not cancelled. */
export const CANCELLABLE_ORDER_STATUSES: readonly StickerOrderStatus[] = [
	'pending',
	'processing',
]
