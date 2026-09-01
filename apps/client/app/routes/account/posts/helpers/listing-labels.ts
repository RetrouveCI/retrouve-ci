import type { UserLostItem } from '@/shared/types/lost-item'
import { formatRelativeDistance } from '@/shared/utils/date'

/**
 * « Cocody, Abidjan · publiée il y a 3 jours ».
 *
 * The date is the publication date, not the event date the public card shows:
 * on this screen the owner's question is how long the listing has been up, and
 * a listing awaiting validation has not been published at all — it was sent.
 *
 * The artboard writes « Récupéré le 12 août · 8 jours en ligne » on a resolved
 * listing. Nothing records when a listing was resolved — there is no
 * `resolvedAt`, and `updatedAt` moves on any edit — so a resolved card says
 * when it went up, like the others.
 */
export function buildTimelineLabel(listing: UserLostItem): string {
	const verb = listing.moderationStatus === 'pending' ? 'envoyée' : 'publiée'

	return `${listing.location} · ${verb} ${formatRelativeDistance(listing.createdAt)}`
}

/** The number the owner came for, so it gets a sentence rather than a count. */
export function buildContactsLabel(contacts: number): string {
	if (contacts === 0) return 'Personne ne vous a écrit'

	return contacts > 1
		? `${contacts} personnes vous ont écrit`
		: '1 personne vous a écrit'
}
