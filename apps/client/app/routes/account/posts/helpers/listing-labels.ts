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

/**
 * A sentence rather than a count. It counts taps on « Contacter », not messages:
 * once WhatsApp opens, nothing knows whether anything was sent. The artboard
 * writes « vous ont écrit », which claims more — assumed deviation (§2).
 */
export function buildContactsLabel(contacts: number): string {
	if (contacts === 0) return "Personne n'a encore cherché à vous joindre"

	return contacts > 1
		? `${contacts} personnes ont voulu vous joindre`
		: '1 personne a voulu vous joindre'
}
