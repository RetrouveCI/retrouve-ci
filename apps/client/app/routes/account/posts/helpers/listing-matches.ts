import type { LostItem, UserLostItem } from '@/shared/types/lost-item'
import type { ListingMatches } from '../types/matches'

/**
 * The matching endpoint requires a published source and only ever answers with
 * listings that are still active. Asking about a listing outside that pair
 * would be an error the loader swallows, so the question is not asked at all.
 */
export function acceptsMatches(listing: UserLostItem): boolean {
	return listing.moderationStatus === 'published' && listing.status === 'active'
}

export function buildMatchesTitle(
	count: number,
	type: LostItem['type'],
): string {
	const found = type === 'lost'

	if (count === 1) {
		return found
			? '1 objet trouvé pourrait correspondre'
			: '1 objet perdu pourrait correspondre'
	}

	return found
		? `${count} objets trouvés pourraient correspondre`
		: `${count} objets perdus pourraient correspondre`
}

/**
 * The artboard reads « Signalés à Cocody cette semaine ». The week is not
 * derivable — the only date filter the API exposes is the event date, and
 * nothing records when a listing was reported — and the town only holds when
 * every listed candidate shares it, since a candidate can score high enough on
 * its category alone. So the sentence claims the town when it is true of what
 * the sheet shows, and falls back on what the query itself guarantees.
 */
export function buildMatchesSubtitle(
	matches: ListingMatches,
	ville: string | undefined,
): string {
	const complete = matches.count === matches.items.length
	const sameVille =
		ville !== undefined &&
		ville.length > 0 &&
		matches.items.every(
			item => item.ville?.toLowerCase() === ville.toLowerCase(),
		)

	if (!complete || !sameVille) return 'Même catégorie ou même ville'

	return matches.count > 1 ? `Signalés à ${ville}` : `Signalé à ${ville}`
}
