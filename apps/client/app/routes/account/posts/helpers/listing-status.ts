import type { UserLostItem } from '@/shared/types/lost-item'

export interface ListingStatusConfig {
	/** `null` on the normal case: a published, live listing needs no exception. */
	label: string | null
	badge: string
	border: string
	/** A listing nobody can reach any more is drawn as the closed thing it is. */
	dimmed: boolean
}

export type ListingDisplayStatus =
	'pending' | 'hidden' | 'active' | 'resolved' | 'expired'

/**
 * The five crossings of the two state axes, in one place. « Mes annonces » and
 * the account overview each carried their own copy, so the overview still said
 * « Active » / « Résolue » / « Expirée » — the words §2.3 rule 2 replaced — and
 * still drew « En attente » at 1,91:1 and « Résolue » at 3,76:1, the two
 * contrast failures R12 fixed on the other copy.
 */
export const LISTING_STATUS: Record<ListingDisplayStatus, ListingStatusConfig> =
	{
		pending: {
			label: 'En attente',
			badge: 'bg-yellow-700 text-white',
			border: 'border-yellow-700/30',
			dimmed: false,
		},
		hidden: {
			label: 'Masquée',
			badge: 'bg-red-700 text-white',
			border: 'border-red-700/30',
			dimmed: true,
		},
		active: {
			label: null,
			badge: '',
			border: 'border-primary-green/25',
			dimmed: false,
		},
		resolved: {
			label: 'Retrouvée',
			badge: 'bg-blue-600 text-white',
			border: 'border-blue-600/25',
			dimmed: true,
		},
		expired: {
			label: 'Archivée',
			badge: 'bg-muted text-muted-foreground',
			border: 'border-border',
			dimmed: true,
		},
	}

/**
 * A status the enumeration does not carry must not take the whole page down —
 * R12 met exactly that, serving the Prisma values in upper case. The contract
 * forbids it API-side, so this is a floor, not a feature.
 */
export const UNKNOWN_LISTING_STATUS: ListingStatusConfig = {
	label: 'État inconnu',
	badge: 'bg-muted text-muted-foreground',
	border: 'border-border',
	dimmed: false,
}

/** Widened by assignment rather than by a cast, so the map stays exhaustive. */
const LOOKUP: Partial<Record<string, ListingStatusConfig>> = LISTING_STATUS

/** Moderation wins over the lifecycle: it is the axis the owner does not choose. */
export function listingStatusFor(listing: UserLostItem): ListingStatusConfig {
	if (listing.moderationStatus === 'pending') return LISTING_STATUS.pending
	if (listing.moderationStatus === 'hidden') return LISTING_STATUS.hidden

	return LOOKUP[listing.status] ?? UNKNOWN_LISTING_STATUS
}
