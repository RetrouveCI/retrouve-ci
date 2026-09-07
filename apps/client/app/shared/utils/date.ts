import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns'
import { fr } from 'date-fns/locale'

/** « il y a 3 jours » — lower case, so it can be read inside a sentence. */
export function formatRelativeDistance(isoDate: string): string {
	return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: fr })
}

export function formatRelativeDate(isoDate: string): string {
	const relative = formatRelativeDistance(isoDate)

	return relative.charAt(0).toUpperCase() + relative.slice(1)
}

// « il y a 2 heures », where `formatRelativeDistance` says « environ 2 heures »:
// used where the line truncates and the approximation reads as noise.
export function formatShortRelativeDistance(isoDate: string): string {
	return formatDistanceToNowStrict(new Date(isoDate), {
		addSuffix: true,
		locale: fr,
	})
}
